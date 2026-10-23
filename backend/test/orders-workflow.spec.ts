import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { OrdersService } from '../src/modules/orders/orders.service';
import { WorkflowService, WORKFLOW_STAGES_SEQUENCE } from '../src/modules/workflow/workflow.service';
import { QualityService } from '../src/modules/quality/quality.service';
import { PrismaService } from '../src/database/prisma.service';
import { AuditService } from '../src/modules/audit/audit.service';
import { WorkflowStage, QualityGateStatus, WorkstationNode, Prisma } from '@prisma/client';

describe('Phase 2: Order Lifecycle, Quality Gates & 22-Milestone State Machine', () => {
  let ordersService: OrdersService;
  let workflowService: WorkflowService;
  let qualityService: QualityService;

  // In-memory mock database for fast and reliable state machine testing
  let ordersDb: Record<string, any> = {};
  let historyDb: any[] = [];
  let fptDb: any[] = [];
  let gptDb: any[] = [];
  let sizeSetDb: any[] = [];

  const mockUserMerchandiser = {
    id: 'user-merch-01',
    fullName: 'Pooja Verma',
    roleType: 'MERCHANDISER',
    assignedNode: WorkstationNode.NODE_01_MERCHANDISING,
    isSuperAdmin: false,
  };

  const mockUserCuttingMaster = {
    id: 'user-cut-04',
    fullName: 'Ramesh Sen',
    roleType: 'CUTTING_MASTER',
    assignedNode: WorkstationNode.NODE_04_CUTTING,
    isSuperAdmin: false,
  };

  const mockUserQualityManager = {
    id: 'user-qm-01',
    fullName: 'Anil Mehta',
    roleType: 'QUALITY_MANAGER',
    assignedNode: WorkstationNode.NODE_10_ADMIN_MD,
    isSuperAdmin: true,
  };

  beforeEach(async () => {
    ordersDb = {};
    historyDb = [];
    fptDb = [];
    gptDb = [];
    sizeSetDb = [];

    const mockPrismaService = {
      order: {
        findUnique: jest.fn().mockImplementation(({ where }) => {
          const order = ordersDb[where.id] || Object.values(ordersDb).find((o: any) => o.orderNumber === where.orderNumber);
          if (!order) return Promise.resolve(null);
          return Promise.resolve({
            ...order,
            fptRecords: fptDb.filter((f) => f.orderId === order.id),
            gptRecords: gptDb.filter((g) => g.orderId === order.id),
            sizeSetApprovals: sizeSetDb.filter((s) => s.orderId === order.id),
            stageHistory: historyDb.filter((h) => h.orderId === order.id),
          });
        }),
        findMany: jest.fn().mockImplementation(() => {
          return Promise.resolve(Object.values(ordersDb));
        }),
        create: jest.fn().mockImplementation(({ data }) => {
          const id = `order-${Date.now()}`;
          const newOrder = {
            id,
            ...data,
            cloudVersion: 1,
            syncStatus: 'PENDING',
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          ordersDb[id] = newOrder;
          return Promise.resolve(newOrder);
        }),
        update: jest.fn().mockImplementation(({ where, data }) => {
          const order = ordersDb[where.id];
          if (!order) return Promise.resolve(null);
          const updated = { ...order, ...data };
          ordersDb[where.id] = updated;
          return Promise.resolve(updated);
        }),
      },
      workflowStageHistory: {
        create: jest.fn().mockImplementation(({ data }) => {
          const item = { id: `hist-${Date.now()}`, ...data, timestamp: new Date() };
          historyDb.push(item);
          return Promise.resolve(item);
        }),
      },
      fptRecord: {
        create: jest.fn().mockImplementation(({ data }) => {
          const item = { id: `fpt-${Date.now()}`, ...data, testedAt: new Date() };
          fptDb.push(item);
          return Promise.resolve(item);
        }),
      },
      gptRecord: {
        create: jest.fn().mockImplementation(({ data }) => {
          const item = { id: `gpt-${Date.now()}`, ...data, testedAt: new Date() };
          gptDb.push(item);
          return Promise.resolve(item);
        }),
      },
      sizeSetApproval: {
        create: jest.fn().mockImplementation(({ data }) => {
          const item = { id: `sizeset-${Date.now()}`, ...data, createdAt: new Date() };
          sizeSetDb.push(item);
          return Promise.resolve(item);
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
        OrdersService,
        WorkflowService,
        QualityService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: AuditService, useValue: mockAuditService },
      ],
    }).compile();

    ordersService = module.get<OrdersService>(OrdersService);
    workflowService = module.get<WorkflowService>(WorkflowService);
    qualityService = module.get<QualityService>(QualityService);
  });

  it('1. should create an order with precise Decimal totalOrderValue and size breakups', async () => {
    const order = await ordersService.create(
      {
        orderNumber: 'ORD-2026-TEST-001',
        buyerPoNumber: 'PO-ZARA-7729',
        customerId: 'cust-zara-01',
        styleId: 'style-twill-01',
        totalQuantity: 1200,
        unitPrice: 450.5,
        targetDeliveryDate: '2026-11-30T00:00:00.000Z',
        sizeSetRequired: true,
        sizeBreakups: [
          { colorName: 'Navy Blue', sizeName: 'M', quantity: 600 },
          { colorName: 'Navy Blue', sizeName: 'L', quantity: 600 },
        ],
      },
      mockUserMerchandiser,
    );

    expect(order.orderNumber).toBe('ORD-2026-TEST-001');
    expect(order.currentStage).toBe(WorkflowStage.ORDER_CONFIRMED);
    // Precision: 1200 * 450.50 = 540600.00
    expect(order.totalOrderValue.toString()).toBe('540600');
    expect(historyDb.length).toBe(1);
    expect(historyDb[0].toStage).toBe(WorkflowStage.ORDER_CONFIRMED);
  });

  it('2. should advance sequentially to FABRIC_INWARD_GRN and FPT_TESTING', async () => {
    const order = await ordersService.create(
      {
        orderNumber: 'ORD-2026-TEST-002',
        buyerPoNumber: 'PO-7730',
        customerId: 'cust-01',
        styleId: 'style-01',
        totalQuantity: 500,
        unitPrice: 350.0,
        targetDeliveryDate: '2026-12-15T00:00:00.000Z',
        sizeSetRequired: true,
        sizeBreakups: [{ colorName: 'Black', sizeName: '32', quantity: 500 }],
      },
      mockUserMerchandiser,
    );

    // Advance to Fabric Inward
    await ordersService.advanceWorkflow(
      order.id,
      { nextStage: WorkflowStage.FABRIC_INWARD_GRN },
      mockUserMerchandiser,
    );
    expect(ordersDb[order.id].currentStage).toBe(WorkflowStage.FABRIC_INWARD_GRN);

    // Advance to FPT Testing
    await ordersService.advanceWorkflow(
      order.id,
      { nextStage: WorkflowStage.FPT_TESTING },
      mockUserMerchandiser,
    );
    expect(ordersDb[order.id].currentStage).toBe(WorkflowStage.FPT_TESTING);
  });

  it('3. QUALITY GATE 1: should BLOCK advancing beyond FPT_TESTING if FPT is not PASSED', async () => {
    const order = await ordersService.create(
      {
        orderNumber: 'ORD-2026-TEST-003',
        buyerPoNumber: 'PO-7731',
        customerId: 'cust-01',
        styleId: 'style-01',
        totalQuantity: 1000,
        unitPrice: 500.0,
        targetDeliveryDate: '2026-12-15T00:00:00.000Z',
        sizeSetRequired: true,
        sizeBreakups: [{ colorName: 'Khaki', sizeName: '34', quantity: 1000 }],
      },
      mockUserMerchandiser,
    );

    await ordersService.advanceWorkflow(order.id, { nextStage: WorkflowStage.FABRIC_INWARD_GRN }, mockUserMerchandiser);
    await ordersService.advanceWorkflow(order.id, { nextStage: WorkflowStage.FPT_TESTING }, mockUserMerchandiser);

    // Attempting to advance to PPE_GPT_TESTING without passing FPT must fail
    await expect(
      ordersService.advanceWorkflow(order.id, { nextStage: WorkflowStage.PPE_GPT_TESTING }, mockUserMerchandiser),
    ).rejects.toThrow(BadRequestException);

    // Record FPT as PASSED
    await qualityService.recordFpt(
      {
        orderId: order.id,
        fabricLotNo: 'LOT-TX-9021',
        shrinkageWarp: -1.8,
        shrinkageWeft: -1.2,
        rubbingDry: 4.5,
        rubbingWet: 4.0,
        washingFastness: 4.5,
        actualGsm: 242.0,
        status: QualityGateStatus.PASSED,
      },
      mockUserQualityManager,
    );

    // Now advancing to PPE_GPT_TESTING should succeed
    const advanced = await ordersService.advanceWorkflow(
      order.id,
      { nextStage: WorkflowStage.PPE_GPT_TESTING },
      mockUserMerchandiser,
    );
    expect(advanced.currentStage).toBe(WorkflowStage.PPE_GPT_TESTING);
  });

  it('4. QUALITY GATE 2 & 3: should BLOCK Cutting if GPT or Size Set is pending', async () => {
    const order = await ordersService.create(
      {
        orderNumber: 'ORD-2026-TEST-004',
        buyerPoNumber: 'PO-7732',
        customerId: 'cust-01',
        styleId: 'style-01',
        totalQuantity: 800,
        unitPrice: 420.0,
        targetDeliveryDate: '2026-12-20T00:00:00.000Z',
        sizeSetRequired: true,
        sizeBreakups: [{ colorName: 'Olive', sizeName: 'M', quantity: 800 }],
      },
      mockUserMerchandiser,
    );

    // Pass FPT
    await qualityService.recordFpt(
      {
        orderId: order.id,
        fabricLotNo: 'LOT-TX-9022',
        shrinkageWarp: -1.5,
        shrinkageWeft: -1.0,
        rubbingDry: 4.5,
        rubbingWet: 4.0,
        washingFastness: 4.5,
        actualGsm: 240.0,
        status: QualityGateStatus.PASSED,
      },
      mockUserQualityManager,
    );

    // Advance to PPE_GPT_TESTING
    await ordersService.advanceWorkflow(order.id, { nextStage: WorkflowStage.PPE_GPT_TESTING }, mockUserMerchandiser);

    // Attempting to advance to CUTTING_COMMENCED without GPT PASSED must fail
    await expect(
      ordersService.advanceWorkflow(order.id, { nextStage: WorkflowStage.CUTTING_COMMENCED }, mockUserMerchandiser),
    ).rejects.toThrow(BadRequestException);

    // Pass GPT
    await qualityService.recordGpt(
      {
        orderId: order.id,
        washAppearance: 'GRADE_4_PASS',
        seamStrengthKg: 28.5,
        torquePercent: 1.8,
        status: QualityGateStatus.PASSED,
      },
      mockUserQualityManager,
    );

    // Still fails to cut because sizeSetRequired is true and Size Set is not yet approved!
    await expect(
      ordersService.advanceWorkflow(order.id, { nextStage: WorkflowStage.CUTTING_COMMENCED }, mockUserMerchandiser),
    ).rejects.toThrow(BadRequestException);

    // Approve Size Set Sample
    await qualityService.recordSizeSetApproval(
      {
        orderId: order.id,
        sampleSize: 'Size M Approved by Buyer Tech Team',
        status: QualityGateStatus.PASSED,
      },
      mockUserQualityManager,
    );

    // Now advancing to CUTTING_COMMENCED must succeed!
    const cutOrder = await ordersService.advanceWorkflow(
      order.id,
      { nextStage: WorkflowStage.CUTTING_COMMENCED },
      mockUserCuttingMaster,
    );
    expect(cutOrder.currentStage).toBe(WorkflowStage.CUTTING_COMMENCED);
  });

  it('5. COMMERCIAL PRIVACY: shop floor cutting master cannot view financial margins', async () => {
    const order = await ordersService.create(
      {
        orderNumber: 'ORD-2026-TEST-005',
        buyerPoNumber: 'PO-CONFIDENTIAL-99',
        customerId: 'cust-luxury',
        styleId: 'style-linen',
        totalQuantity: 2000,
        unitPrice: 1850.0,
        targetDeliveryDate: '2026-12-30T00:00:00.000Z',
        sizeSetRequired: false,
        sizeBreakups: [{ colorName: 'White', sizeName: 'L', quantity: 2000 }],
      },
      mockUserMerchandiser,
    );

    // 1. Cutting master queries the order
    const floorView: any = await ordersService.findOne(order.id, mockUserCuttingMaster);
    expect(floorView.orderNumber).toBe('ORD-2026-TEST-005');
    expect(floorView.totalQuantity).toBe(2000);
    // Financial fields must be strictly stripped
    expect(floorView.unitPrice).toBeNull();
    expect(floorView.totalOrderValue).toBeNull();
    expect(floorView.isFinancialDataMasked).toBe(true);

    // 2. Merchandiser queries the order (unmasked)
    const officeView: any = await ordersService.findOne(order.id, mockUserMerchandiser);
    expect(officeView.unitPrice.toString()).toBe('1850');
    expect(officeView.totalOrderValue.toString()).toBe('3700000');
    expect(officeView.isFinancialDataMasked).toBeUndefined();
  });

  it('6. WORKFLOW HISTORY: stage transitions must record user, role, node, and comments', async () => {
    const order = await ordersService.create(
      {
        orderNumber: 'ORD-2026-TEST-006',
        buyerPoNumber: 'PO-HIST-1',
        customerId: 'cust-01',
        styleId: 'style-01',
        totalQuantity: 300,
        unitPrice: 200.0,
        targetDeliveryDate: '2026-12-10T00:00:00.000Z',
        sizeSetRequired: false,
        sizeBreakups: [{ colorName: 'Red', sizeName: 'S', quantity: 300 }],
      },
      mockUserMerchandiser,
    );

    await ordersService.advanceWorkflow(
      order.id,
      {
        nextStage: WorkflowStage.FABRIC_INWARD_GRN,
        comments: 'Fabric rolls received at Gate 1, inspected by Store In-charge',
      },
      mockUserMerchandiser,
    );

    const latestHistory = historyDb[historyDb.length - 1];
    expect(latestHistory.orderId).toBe(order.id);
    expect(latestHistory.fromStage).toBe(WorkflowStage.ORDER_CONFIRMED);
    expect(latestHistory.toStage).toBe(WorkflowStage.FABRIC_INWARD_GRN);
    expect(latestHistory.transitionedBy).toBe('Pooja Verma (MERCHANDISER)');
    expect(latestHistory.terminalNode).toBe(WorkstationNode.NODE_01_MERCHANDISING);
    expect(latestHistory.comments).toBe('Fabric rolls received at Gate 1, inspected by Store In-charge');
  });
});
