import { Test, TestingModule } from '@nestjs/testing';
import { SyncService } from '../src/modules/sync/sync.service';
import { PrismaService } from '../src/database/prisma.service';
import { SyncOperation, WorkstationNode } from '@prisma/client';

describe('Phase 6: Factory-to-Cloud Reliable Sync Engine', () => {
  let syncService: SyncService;

  let outboxDb: any[] = [];
  let checkpointDb: Record<string, any> = {};
  let conflictDb: any[] = [];
  let nextOutboxId = BigInt(1);

  beforeEach(async () => {
    outboxDb = [];
    checkpointDb = {};
    conflictDb = [];
    nextOutboxId = BigInt(1);

    const mockPrismaService: any = {
      syncOutbox: {
        create: jest.fn().mockImplementation(({ data }) => {
          const entry = {
            id: nextOutboxId++,
            entityName: data.entityName,
            entityId: data.entityId,
            operation: data.operation,
            payload: data.payload,
            version: data.version,
            originNode: data.originNode,
            isDispatched: data.isDispatched ?? false,
            dispatchedAt: null,
            retryCount: 0,
            lastError: null,
            createdAt: new Date(),
          };
          outboxDb.push(entry);
          return entry;
        }),
        findMany: jest.fn().mockImplementation(({ where, orderBy, take }) => {
          let results = [...outboxDb];
          if (where?.id?.gt !== undefined) {
            results = results.filter((e) => e.id > where.id.gt);
          }
          if (orderBy?.id === 'asc') {
            results.sort((a, b) => (a.id > b.id ? 1 : -1));
          }
          if (take) {
            results = results.slice(0, take);
          }
          return results;
        }),
        findFirst: jest.fn().mockImplementation(({ where, orderBy }) => {
          let matches = outboxDb.filter((e) => {
            if (where.entityName && e.entityName !== where.entityName) return false;
            if (where.entityId && e.entityId !== where.entityId) return false;
            return true;
          });
          if (orderBy?.version === 'desc') {
            matches.sort((a, b) => b.version - a.version);
          }
          return matches[0] || null;
        }),
        updateMany: jest.fn().mockImplementation(({ where, data }) => {
          let count = 0;
          for (const item of outboxDb) {
            if (where?.id?.lte !== undefined && item.id <= where.id.lte) {
              if (where?.isDispatched !== undefined && item.isDispatched !== where.isDispatched) {
                continue;
              }
              Object.assign(item, data);
              count++;
            }
          }
          return { count };
        }),
      },
      syncCheckpoint: {
        findUnique: jest.fn().mockImplementation(({ where }) => {
          return checkpointDb[where.clientNodeId] || null;
        }),
        upsert: jest.fn().mockImplementation(({ where, update, create }) => {
          let existing = checkpointDb[where.clientNodeId];
          if (existing) {
            Object.assign(existing, update);
            return existing;
          } else {
            const newCp = {
              id: `cp-${where.clientNodeId}`,
              clientNodeId: where.clientNodeId,
              lastSyncedOutboxId: create.lastSyncedOutboxId,
              lastSyncAt: create.lastSyncAt,
            };
            checkpointDb[where.clientNodeId] = newCp;
            return newCp;
          }
        }),
      },
      syncConflictLog: {
        create: jest.fn().mockImplementation(({ data }) => {
          const conflict = {
            id: `conflict-${Date.now()}-${conflictDb.length + 1}`,
            ...data,
            createdAt: new Date(),
          };
          conflictDb.push(conflict);
          return conflict;
        }),
        findFirst: jest.fn().mockImplementation(({ where }) => {
          return (
            conflictDb.find(
              (c) =>
                c.entityName === where.entityName &&
                c.entityId === where.entityId &&
                c.resolution === where.resolution,
            ) || null
          );
        }),
        findMany: jest.fn().mockImplementation(() => conflictDb),
        findUnique: jest.fn().mockImplementation(({ where }) => {
          return conflictDb.find((c) => c.id === where.id) || null;
        }),
        update: jest.fn().mockImplementation(({ where, data }) => {
          const item = conflictDb.find((c) => c.id === where.id);
          if (item) {
            Object.assign(item, data);
            return item;
          }
          return null;
        }),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SyncService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    syncService = module.get<SyncService>(SyncService);
  });

  describe('1. Outbox Recording & Incremental Pulling', () => {
    it('should record local mutation events into durable Outbox queue', async () => {
      const event1 = await syncService.recordOutboxEvent(
        'Order',
        'ord-101',
        SyncOperation.INSERT,
        { orderNumber: 'GF-ORD-101', quantity: 500 },
        WorkstationNode.NODE_01_MERCHANDISING,
        1,
      );

      const event2 = await syncService.recordOutboxEvent(
        'StitchingEndlineLog',
        'stitch-log-202',
        SyncOperation.INSERT,
        { orderId: 'ord-101', passed: 120 },
        WorkstationNode.NODE_05_SEWING,
        1,
      );

      expect(event1.id).toBeDefined();
      expect(event2.id).toBeDefined();
      expect(outboxDb).toHaveLength(2);
    });

    it('should pull only new events beyond client last synced checkpoint', async () => {
      // Create 3 events
      await syncService.recordOutboxEvent(
        'Order',
        'ord-01',
        SyncOperation.INSERT,
        { orderNumber: 'GF-01' },
        WorkstationNode.NODE_01_MERCHANDISING,
        1,
      );
      await syncService.recordOutboxEvent(
        'Order',
        'ord-02',
        SyncOperation.INSERT,
        { orderNumber: 'GF-02' },
        WorkstationNode.NODE_01_MERCHANDISING,
        1,
      );
      await syncService.recordOutboxEvent(
        'Order',
        'ord-03',
        SyncOperation.INSERT,
        { orderNumber: 'GF-03' },
        WorkstationNode.NODE_01_MERCHANDISING,
        1,
      );

      // Client node pulls from beginning (checkpoint 0)
      const pull1 = await syncService.getPendingOutboxEvents('factory-node-alpha', 2);
      expect(pull1.events).toHaveLength(2);
      expect(pull1.events[0].entityId).toBe('ord-01');
      expect(pull1.events[1].entityId).toBe('ord-02');

      // Client acknowledges sync up to event 2
      await syncService.acknowledgeSync({
        clientNodeId: 'factory-node-alpha',
        lastSyncedOutboxId: pull1.events[1].id,
      });

      // Pull again -> should only get event 3!
      const pull2 = await syncService.getPendingOutboxEvents('factory-node-alpha', 10);
      expect(pull2.events).toHaveLength(1);
      expect(pull2.events[0].entityId).toBe('ord-03');
    });
  });

  describe('2. Disconnected Offline Recovery & Acknowledgment', () => {
    it('should mark dispatched status and advance checkpoint on reconnection', async () => {
      await syncService.recordOutboxEvent(
        'CutBundle',
        'bndl-99',
        SyncOperation.INSERT,
        { bundleNo: 99, size: 'L' },
        WorkstationNode.NODE_04_CUTTING,
        1,
      );

      const pull = await syncService.getPendingOutboxEvents('cloud-portal');
      expect(pull.events).toHaveLength(1);

      const ack = await syncService.acknowledgeSync({
        clientNodeId: 'cloud-portal',
        lastSyncedOutboxId: pull.events[0].id,
      });

      expect(ack.clientNodeId).toBe('cloud-portal');
      expect(ack.lastSyncedOutboxId).toBe('1');
      expect(outboxDb[0].isDispatched).toBe(true);
    });
  });

  describe('3. Conflict Detection & Super Admin Resolution', () => {
    it('should detect higher local version conflict and log into SyncConflictLog', async () => {
      // Local has version 3 of Order ord-101
      await syncService.recordOutboxEvent(
        'Order',
        'ord-101',
        SyncOperation.UPDATE,
        { orderNumber: 'GF-ORD-101', quantity: 600, status: 'STITCHING' },
        WorkstationNode.NODE_05_SEWING,
        3,
      );

      // Incoming batch from cloud has outdated version 2
      const result = await syncService.applyIncomingSync({
        clientNodeId: 'cloud-portal',
        events: [
          {
            entityName: 'Order',
            entityId: 'ord-101',
            operation: SyncOperation.UPDATE,
            payload: { orderNumber: 'GF-ORD-101', quantity: 500, status: 'CUTTING' },
            version: 2,
            originNode: WorkstationNode.NODE_01_MERCHANDISING,
          },
        ],
      });

      expect(result.conflictCount).toBe(1);
      expect(result.appliedCount).toBe(0);
      expect(conflictDb).toHaveLength(1);
      expect(conflictDb[0].entityId).toBe('ord-101');
      expect(conflictDb[0].resolution).toBe('PENDING');
    });

    it('should allow Super Admin / MD to resolve sync conflict', async () => {
      // Record conflict
      conflictDb.push({
        id: 'conflict-test-01',
        entityName: 'Order',
        entityId: 'ord-101',
        cloudPayload: { quantity: 500 },
        localPayload: { quantity: 600 },
        resolution: 'PENDING',
        createdAt: new Date(),
      });

      const resolved = await syncService.resolveConflict(
        'conflict-test-01',
        { resolution: 'APPLY_LOCAL' },
        'Mrityunjay Pareek (MD)',
      );

      expect(resolved.resolution).toBe('APPLY_LOCAL');
      expect(resolved.resolvedBy).toBe('Mrityunjay Pareek (MD)');
      expect(resolved.resolvedAt).toBeDefined();
    });
  });
});
