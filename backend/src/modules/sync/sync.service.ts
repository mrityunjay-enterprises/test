import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
  SyncEventDto,
  AcknowledgeSyncDto,
  IncomingSyncBatchDto,
  ResolveConflictDto,
} from './dto/sync.dto';
import { SyncOperation, WorkstationNode } from '@prisma/client';

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * 1. Append a mutation to the durable Outbox for asynchronous synchronization
   */
  async recordOutboxEvent(
    entityName: string,
    entityId: string,
    operation: SyncOperation,
    payload: any,
    originNode: WorkstationNode,
    version = 1,
  ) {
    return this.prisma.syncOutbox.create({
      data: {
        entityName,
        entityId,
        operation,
        payload,
        version,
        originNode,
        isDispatched: false,
      },
    });
  }

  /**
   * 2. Pull pending outbox events for a connecting client node
   */
  async getPendingOutboxEvents(clientNodeId: string, limit = 100) {
    const checkpoint = await this.prisma.syncCheckpoint.findUnique({
      where: { clientNodeId },
    });

    const lastSyncedId = checkpoint ? checkpoint.lastSyncedOutboxId : BigInt(0);

    const pending = await this.prisma.syncOutbox.findMany({
      where: {
        id: { gt: lastSyncedId },
      },
      orderBy: { id: 'asc' },
      take: limit,
    });

    return {
      clientNodeId,
      lastSyncedOutboxId: lastSyncedId.toString(),
      totalPending: pending.length,
      events: pending.map((e) => ({
        id: e.id.toString(),
        entityName: e.entityName,
        entityId: e.entityId,
        operation: e.operation,
        payload: e.payload,
        version: e.version,
        originNode: e.originNode,
        createdAt: e.createdAt,
      })),
    };
  }

  /**
   * 3. Acknowledge receipt and advance checkpoint
   */
  async acknowledgeSync(dto: AcknowledgeSyncDto) {
    const lastSyncedId = BigInt(dto.lastSyncedOutboxId);

    const checkpoint = await this.prisma.syncCheckpoint.upsert({
      where: { clientNodeId: dto.clientNodeId },
      update: {
        lastSyncedOutboxId: lastSyncedId,
        lastSyncAt: new Date(),
      },
      create: {
        clientNodeId: dto.clientNodeId,
        lastSyncedOutboxId: lastSyncedId,
        lastSyncAt: new Date(),
      },
    });

    // Mark acknowledged outbox items as dispatched
    await this.prisma.syncOutbox.updateMany({
      where: {
        id: { lte: lastSyncedId },
        isDispatched: false,
      },
      data: {
        isDispatched: true,
        dispatchedAt: new Date(),
      },
    });

    return {
      clientNodeId: checkpoint.clientNodeId,
      lastSyncedOutboxId: checkpoint.lastSyncedOutboxId.toString(),
      lastSyncAt: checkpoint.lastSyncAt,
    };
  }

  /**
   * 4. Apply incoming batch of changes received from remote Factory LAN / Cloud Portal
   */
  async applyIncomingSync(batch: IncomingSyncBatchDto) {
    let appliedCount = 0;
    let conflictCount = 0;

    for (const event of batch.events) {
      // Check if entity has an existing local conflict
      const existingConflict = await this.prisma.syncConflictLog.findFirst({
        where: {
          entityName: event.entityName,
          entityId: event.entityId,
          resolution: 'PENDING',
        },
      });

      if (existingConflict) {
        this.logger.warn(
          `Conflict exists for ${event.entityName} ${event.entityId}. Skipping automatic sync until resolved.`,
        );
        conflictCount++;
        continue;
      }

      // Check version conflict detection
      const recentOutbox = await this.prisma.syncOutbox.findFirst({
        where: {
          entityName: event.entityName,
          entityId: event.entityId,
        },
        orderBy: { version: 'desc' },
      });

      if (recentOutbox && recentOutbox.version > event.version) {
        // Local has a newer version than incoming cloud mutation -> Conflict!
        await this.prisma.syncConflictLog.create({
          data: {
            entityName: event.entityName,
            entityId: event.entityId,
            cloudPayload: event.payload,
            localPayload: recentOutbox.payload as any,
            resolution: 'PENDING',
          },
        });
        conflictCount++;
        continue;
      }

      appliedCount++;
    }

    return {
      batchSize: batch.events.length,
      appliedCount,
      conflictCount,
    };
  }

  /**
   * 5. Retrieve all sync conflicts
   */
  async getConflictLogs() {
    return this.prisma.syncConflictLog.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * 6. Resolve conflict
   */
  async resolveConflict(
    conflictId: string,
    dto: ResolveConflictDto,
    resolvedBy: string,
  ) {
    const conflict = await this.prisma.syncConflictLog.findUnique({
      where: { id: conflictId },
    });

    if (!conflict) {
      throw new NotFoundException(`Sync conflict ${conflictId} not found`);
    }

    return this.prisma.syncConflictLog.update({
      where: { id: conflictId },
      data: {
        resolution: dto.resolution,
        resolvedBy,
        resolvedAt: new Date(),
      },
    });
  }
}
