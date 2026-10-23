import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ProductionService } from '../src/modules/production/production.service';
import { PrismaService } from '../src/database/prisma.service';
import { AuditService } from '../src/modules/audit/audit.service';
import { WorkflowStage, WorkstationNode } from '@prisma/client';

describe('Phase 3: Manufacturing Shop-Floor Module (Cutting, Stitching, Finishing)', () => {
  let productionService: ProductionService;

  let ordersDb: Record<string, any> = {};
  let cutReportsDb: any[] = [];
  let bundlesDb: any[] = [];
  let sizeBreakupDb: any[] = [];
  let endlineLogsDb: any[] = [];
  let finishingDb: Record<string, any> = {};
  let historyDb: any[] = [];

  const mockUserCuttingMaster = {
    id: 'user-cut-04',
    fullName: 'Ramesh Sen',
    roleType: 'CUTTING_MASTER',
    assignedNode: WorkstationNode.NODE_04_CUTTING,
  };

  const mockUserSewingSupervisor = {
    id: 'user-sew-05',
    fullName: 'Suresh Yadav',
    roleType: 'SEWING_SUPERVISOR',
    assignedNode: WorkstationNode.NODE_05_SEWING,
  };

  const mockUserFinishingIncharge = {
    id: 'user-fin-06',
    fullName: 'Dinesh Sharma',
    roleType: 'FINISHING_INCHARGE',
    assignedNode: WorkstationNode.NODE_06_FINISHING,
  };

  beforeEach(async () => {
    ordersDb = {
      'order-prod-01': {
        id: 'order-prod-01',
        orderNumber: 'ORD-2026-PROD-001',
        totalQuantity: 1000,
        currentStage: WorkflowStage.CUTTING_COMMENCED,
        sizeBreakups: [
          { orderId: 'order-prod-01', sizeName: 'M', colorName: 'Navy', quantity: 500, cutQuantity: 0 },
          { orderId: 'order-prod-01', sizeName: 'L', colorName: 'Navy', quantity: 500, cutQuantity: 0 },
        ],
      },
    };
    cutReportsDb = [];
    bundlesDb = [];
    sizeBreakupDb = [...ordersDb['order-prod-01'].sizeBreakups];
    endlineLogsDb = [];
    finishingDb = {};
    historyDb = [];

    const mockPrismaService = {
      order: {
        findUnique: jest.fn().mockImplementation(({ where }) => {
          const order = ordersDb[where.id];
          if (!order) return Promise.resolve(null);
          return Promise.resolve({
            ...order,
            sizeBreakups: sizeBreakupDb.filter((sb) => sb.orderId === order.id),
            cutReports: cutReportsDb.filter((c) => c.orderId === order.id),
            cutBundles: bundlesDb.filter((b) => b.orderId === order.id),
            endlineLogs: endlineLogsDb.filter((e) => e.orderId === order.id),
            finishingPipelines: finishingDb[order.id] ? [finishingDb[order.id]] : [],
          });
        }),
        update: jest.fn().mockImplementation(({ where, data }) => {
          ordersDb[where.id] = { ...ordersDb[where.id], ...data };
          return Promise.resolve(ordersDb[where.id]);
        }),
      },
      cutOrderReport: {
        findUnique: jest.fn().mockImplementation(({ where }) => {
          return Promise.resolve(cutReportsDb.find((c) => c.reportNumber === where.reportNumber) || null);
        }),
        create: jest.fn().mockImplementation(({ data }) => {
          const item = { id: `cut-rep-${Date.now()}`, ...data };
          cutReportsDb.push(item);
          return Promise.resolve(item);
        }),
      },
      cutBundle: {
        create: jest.fn().mockImplementation(({ data }) => {
          const item = { id: `bnd-${Date.now()}`, ...data };
          bundlesDb.push(item);
          return Promise.resolve(item);
        }),
      },
      orderSizeBreakup: {
        updateMany: jest.fn().mockImplementation(({ where, data }) => {
          sizeBreakupDb.forEach((sb) => {
            if (sb.orderId === where.orderId && sb.sizeName === where.sizeName && sb.colorName === where.colorName) {
              sb.cutQuantity += data.cutQuantity.increment;
            }
          });
          return Promise.resolve({ count: 1 });
        }),
      },
      workflowStageHistory: {
        create: jest.fn().mockImplementation(({ data }) => {
          const item = { id: `hist-${Date.now()}`, ...data };
          historyDb.push(item);
          return Promise.resolve(item);
        }),
      },
      stitchingEndlineLog: {
        create: jest.fn().mockImplementation(({ data }) => {
          const item = { id: `endline-${Date.now()}`, ...data, recordedAt: new Date() };
          endlineLogsDb.push(item);
          return Promise.resolve(item);
        }),
      },
      finishingPipelineLog: {
        upsert: jest.fn().mockImplementation(({ where, create, update }) => {
          const existing = finishingDb[where.orderId];
          if (!existing) {
            finishingDb[where.orderId] = { id: `fin-${Date.now()}`, ...create, updatedAt: new Date() };
          } else {
            for (const [key, val] of Object.entries(update)) {
              if (val && typeof val === 'object' && 'increment' in (val as any)) {
                existing[key] = (existing[key] || 0) + (val as any).increment;
              } else {
                existing[key] = val;
              }
            }
            existing.updatedAt = new Date();
          }
          return Promise.resolve(finishingDb[where.orderId]);
        }),
      },
      $transaction: jest.fn().mockImplementation(async (callbackOrArray) => {
        if (typeof callbackOrArray === 'function') {
          return callbackOrArray(mockPrismaService);
        }
        return Promise.all(callbackOrArray);
      }),
    };

    const mockAuditService = {
      log: jest.fn().mockResolvedValue({}),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductionService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: AuditService, useValue: mockAuditService },
      ],
    }).compile();

    productionService = module.get<ProductionService>(ProductionService);
  });

  describe('1. Cutting Floor & Cut Order Report Generator', () => {
    it('should generate Cut Order Report, calculate actual consumption, and create barcoded bundles', async () => {
      const cutReport = await productionService.generateCutOrderReport(
        {
          orderId: 'order-prod-01',
          reportNumber: 'CR-2026-0089',
          pliesCut: 50,
          totalPiecesCut: 1000,
          actualFabMeters: 1650.0, // 1650m / 1000 pcs = 1.6500 mtr/pc
          targetConsumptionPerPc: 1.6, // Target was 1.60 mtr/pc
          bundleStartNo: 1,
          bundleEndNo: 20,
          bundles: [
            { bundleNumber: 'B01', sizeName: 'M', colorName: 'Navy', piecesCount: 50 },
            { bundleNumber: 'B02', sizeName: 'M', colorName: 'Navy', piecesCount: 50 },
            { bundleNumber: 'B03', sizeName: 'L', colorName: 'Navy', piecesCount: 50 },
          ],
        },
        mockUserCuttingMaster,
      );

      expect(cutReport.reportNumber).toBe('CR-2026-0089');
      expect(cutReport.totalPiecesCut).toBe(1000);
      expect(cutReport.consumptionPerPc.toString()).toBe('1.65');

      // Verify bundles were created with unique barcodes
      expect(bundlesDb.length).toBe(3);
      expect(bundlesDb[0].barcode).toBe('BND-ORD-2026-PROD-001-B01');
      expect(bundlesDb[0].currentLocation).toBe('CUTTING_FLOOR');

      // Verify size breakups cut quantity updated
      const mediumBreakup = sizeBreakupDb.find((sb) => sb.sizeName === 'M');
      expect(mediumBreakup.cutQuantity).toBe(100);

      // Verify workflow stage advanced from CUTTING_COMMENCED to CUT_ORDER_REPORT_GENERATED
      expect(ordersDb['order-prod-01'].currentStage).toBe(WorkflowStage.CUT_ORDER_REPORT_GENERATED);
      expect(historyDb.length).toBe(1);
    });

    it('should prevent duplicate cut report number creation', async () => {
      await productionService.generateCutOrderReport(
        {
          orderId: 'order-prod-01',
          reportNumber: 'CR-UNIQUE-01',
          pliesCut: 20,
          totalPiecesCut: 200,
          actualFabMeters: 330.0,
          targetConsumptionPerPc: 1.65,
          bundleStartNo: 1,
          bundleEndNo: 4,
          bundles: [],
        },
        mockUserCuttingMaster,
      );

      await expect(
        productionService.generateCutOrderReport(
          {
            orderId: 'order-prod-01',
            reportNumber: 'CR-UNIQUE-01', // Duplicate!
            pliesCut: 20,
            totalPiecesCut: 200,
            actualFabMeters: 330.0,
            targetConsumptionPerPc: 1.65,
            bundleStartNo: 1,
            bundleEndNo: 4,
            bundles: [],
          },
          mockUserCuttingMaster,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('2. Stitching Lines & Endline QC Reconciliation Math', () => {
    it('should record stitching endline log when inspected count balances exactly', async () => {
      // 100 inspected = 92 good + 5 alteration + 2 repaired + 1 damaged scrap
      const log = await productionService.logStitchingEndline(
        {
          orderId: 'order-prod-01',
          productionLineId: 'LINE_02',
          inspectedPieces: 100,
          goodPassed: 92,
          underAlteration: 5,
          repairedPieces: 2,
          damagedScrap: 1,
          shiftName: 'SHIFT_MORNING',
        },
        mockUserSewingSupervisor,
      );

      expect(log.inspectedPieces).toBe(100);
      expect(log.goodPassed).toBe(92);
      expect(log.damagedScrap).toBe(1);
      expect(log.inspectorName).toBe('Suresh Yadav');
      expect(endlineLogsDb.length).toBe(1);
    });

    it('should REJECT logging when inspected count does not balance (Quality Math Guard)', async () => {
      // 100 inspected != 90 good + 5 alteration (Total is 95, 5 pieces unaccounted for!)
      await expect(
        productionService.logStitchingEndline(
          {
            orderId: 'order-prod-01',
            productionLineId: 'LINE_02',
            inspectedPieces: 100,
            goodPassed: 90,
            underAlteration: 5,
            repairedPieces: 0,
            damagedScrap: 0,
            shiftName: 'SHIFT_MORNING',
          },
          mockUserSewingSupervisor,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('3. Finishing Floor 6-Stage Dedicated Pipeline', () => {
    it('should advance pieces across Stage 1 to Stage 6 with rework feedback loops', async () => {
      // Stage 1: Bartack, Eyelet & Button (150 pcs passed)
      await productionService.updateFinishingStage(
        {
          orderId: 'order-prod-01',
          stage: 'STAGE_1_BARTACK_EYELET_BUTTON',
          passedQty: 150,
        },
        mockUserFinishingIncharge,
      );
      expect(finishingDb['order-prod-01'].bartackButtonPassed).toBe(150);

      // Stage 2: Thread Trimming (150 pcs trimmed)
      await productionService.updateFinishingStage(
        {
          orderId: 'order-prod-01',
          stage: 'STAGE_2_THREAD_TRIMMING',
          passedQty: 150,
        },
        mockUserFinishingIncharge,
      );
      expect(finishingDb['order-prod-01'].threadCutPassed).toBe(150);

      // Stage 3: Press 1 Under-Pressing (150 pcs flattened)
      await productionService.updateFinishingStage(
        {
          orderId: 'order-prod-01',
          stage: 'STAGE_3_PRESS_1',
          passedQty: 150,
        },
        mockUserFinishingIncharge,
      );
      expect(finishingDb['order-prod-01'].press1Passed).toBe(150);

      // Stage 4: Initial QC Check (140 Passed, 10 Failed -> 8 Repaired to Press, 2 Unrepairable Scrap)
      await productionService.updateFinishingStage(
        {
          orderId: 'order-prod-01',
          stage: 'STAGE_4_INITIAL_QC_CHECK',
          passedQty: 140,
          failedQty: 10,
          repairedQty: 8,
          damagedQty: 2,
        },
        mockUserFinishingIncharge,
      );
      expect(finishingDb['order-prod-01'].initialCheckPassed).toBe(140);
      expect(finishingDb['order-prod-01'].initialCheckFailed).toBe(10);
      expect(finishingDb['order-prod-01'].repairedToPress).toBe(8);
      expect(finishingDb['order-prod-01'].damagedScrapTotal).toBe(2);

      // Stage 5: Final Press (148 pcs - 140 original + 8 repaired)
      await productionService.updateFinishingStage(
        {
          orderId: 'order-prod-01',
          stage: 'STAGE_5_FINAL_PRESS',
          passedQty: 148,
        },
        mockUserFinishingIncharge,
      );
      expect(finishingDb['order-prod-01'].finalPressPassed).toBe(148);

      // Stage 6: Final QA Audit (148 passed ready for packing)
      await productionService.updateFinishingStage(
        {
          orderId: 'order-prod-01',
          stage: 'STAGE_6_FINAL_QA_AUDIT',
          passedQty: 148,
        },
        mockUserFinishingIncharge,
      );
      expect(finishingDb['order-prod-01'].finalQaPassed).toBe(148);

      // Retrieve aggregated production summary
      const summary = await productionService.getOrderProductionSummary('order-prod-01');
      expect(summary.finishingStatus.finalQaPassed).toBe(148);
      expect(summary.finishingStatus.damagedScrapTotal).toBe(2);
    });
  });
});
