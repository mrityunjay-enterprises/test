import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { PayrollService } from '../src/modules/payroll/payroll.service';
import { LaborService } from '../src/modules/labor/labor.service';
import { HrmsService } from '../src/modules/hrms/hrms.service';
import { PrismaService } from '../src/database/prisma.service';
import { AuditService } from '../src/modules/audit/audit.service';
import { WageModel, PayrollStatus, WorkstationNode, Prisma } from '@prisma/client';

describe('Phase 4: HRMS, Verified Attendance & Dual-Wage Payroll Engine', () => {
  let payrollService: PayrollService;
  let laborService: LaborService;
  let hrmsService: HrmsService;

  let employeesDb: Record<string, any> = {};
  let periodsDb: Record<string, any> = {};
  let slipsDb: any[] = [];
  let attendanceDb: any[] = [];
  let pieceTicketsDb: any[] = [];

  const mockUserAccountsExecutive = {
    id: 'user-acc-01',
    fullName: 'Pooja Agarwal',
    roleType: 'ACCOUNTS_HR_EXECUTIVE',
    assignedNode: WorkstationNode.NODE_08_ACCOUNTS_HR_1,
  };

  beforeEach(async () => {
    employeesDb = {
      'emp-piece-01': {
        id: 'emp-piece-01',
        employeeCode: 'EMP-T01',
        fullName: 'Ramesh Kumar (Tailor)',
        wageModel: WageModel.PIECE_RATE,
        defaultPieceRate: new Prisma.Decimal(9.5),
        bankName: 'State Bank of India',
        bankAccountNo: '1122334455',
        ifscCode: 'SBIN0001234',
        isActive: true,
      },
      'emp-hourly-02': {
        id: 'emp-hourly-02',
        employeeCode: 'EMP-H02',
        fullName: 'Suresh Helper (Shop Floor)',
        wageModel: WageModel.HOURLY_WAGE,
        baseHourlyRate: new Prisma.Decimal(90.0),
        bankName: 'HDFC Bank',
        bankAccountNo: '5566778899',
        ifscCode: 'HDFC0005678',
        isActive: true,
      },
      'emp-salaried-03': {
        id: 'emp-salaried-03',
        employeeCode: 'EMP-M03',
        fullName: 'Dinesh Pattern Master',
        wageModel: WageModel.MONTHLY_SALARIED,
        baseSalaryMonthly: new Prisma.Decimal(39000.0),
        uanNumber: '100998877665', // Has PF
        bankName: 'Punjab National Bank',
        bankAccountNo: '9988112233',
        ifscCode: 'PUNB0009999',
        isActive: true,
      },
    };

    periodsDb = {
      'period-2026-10': {
        id: 'period-2026-10',
        periodCode: '2026-10',
        startDate: new Date('2026-10-01'),
        endDate: new Date('2026-10-31'),
        status: PayrollStatus.DRAFT,
      },
    };

    slipsDb = [];
    attendanceDb = [];
    pieceTicketsDb = [];

    const mockPrismaService = {
      employee: {
        findUnique: jest.fn().mockImplementation(({ where }) => Promise.resolve(employeesDb[where.id] || null)),
        findMany: jest.fn().mockImplementation(() => {
          return Promise.resolve(
            Object.values(employeesDb).map((emp) => ({
              ...emp,
              attendanceLogs: attendanceDb.filter((a) => a.employeeId === emp.id),
              pieceWorkTickets: pieceTicketsDb.filter((p) => p.employeeId === emp.id),
            })),
          );
        }),
      },
      order: {
        findUnique: jest.fn().mockResolvedValue({ id: 'order-01', orderNumber: 'ORD-2026-0892' }),
      },
      payrollPeriod: {
        findUnique: jest.fn().mockImplementation(({ where }) => {
          const p = periodsDb[where.id] || Object.values(periodsDb).find((x: any) => x.periodCode === where.periodCode);
          if (!p) return Promise.resolve(null);
          return Promise.resolve({
            ...p,
            payrollSlips: slipsDb.filter((s) => s.periodId === p.id),
          });
        }),
        update: jest.fn().mockImplementation(({ where, data }) => {
          periodsDb[where.id] = { ...periodsDb[where.id], ...data };
          return Promise.resolve(periodsDb[where.id]);
        }),
      },
      payrollSlip: {
        findUnique: jest.fn().mockImplementation(({ where }) => {
          const s = slipsDb.find((x) => x.id === where.id);
          if (!s) return Promise.resolve(null);
          return Promise.resolve({
            ...s,
            employee: employeesDb[s.employeeId],
            period: periodsDb[s.periodId],
          });
        }),
        upsert: jest.fn().mockImplementation(({ where, create, update }) => {
          let s = slipsDb.find(
            (x) => x.periodId === where.periodId_employeeId.periodId && x.employeeId === where.periodId_employeeId.employeeId,
          );
          if (!s) {
            s = { id: `slip-${Date.now()}-${Math.random()}`, ...create };
            slipsDb.push(s);
          } else {
            Object.assign(s, update);
          }
          return Promise.resolve(s);
        }),
        updateMany: jest.fn().mockImplementation(({ where, data }) => {
          slipsDb.forEach((s) => {
            if (s.periodId === where.periodId) Object.assign(s, data);
          });
          return Promise.resolve({ count: slipsDb.length });
        }),
      },
      pieceWorkTicket: {
        create: jest.fn().mockImplementation(({ data }) => {
          const t = { id: `ticket-${Date.now()}`, ...data };
          pieceTicketsDb.push(t);
          return Promise.resolve(t);
        }),
        findMany: jest.fn().mockImplementation(({ where }) => {
          return Promise.resolve(
            pieceTicketsDb
              .filter((t) => t.employeeId === where.employeeId)
              .map((t) => ({ ...t, order: { orderNumber: 'ORD-2026-0892' } })),
          );
        }),
      },
      attendanceDaily: {
        upsert: jest.fn().mockImplementation(({ create }) => {
          const a = { id: `att-${Date.now()}`, ...create };
          attendanceDb.push(a);
          return Promise.resolve(a);
        }),
      },
      $transaction: jest.fn().mockImplementation(async (callbackOrArray) => {
        if (typeof callbackOrArray === 'function') return callbackOrArray(mockPrismaService);
        return Promise.all(callbackOrArray);
      }),
    };

    const mockAuditService = { log: jest.fn().mockResolvedValue({}) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PayrollService,
        LaborService,
        HrmsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: AuditService, useValue: mockAuditService },
      ],
    }).compile();

    payrollService = module.get<PayrollService>(PayrollService);
    laborService = module.get<LaborService>(LaborService);
    hrmsService = module.get<HrmsService>(HrmsService);
  });

  it('1. GOLDEN QUALITY RULE: Piece-rate tailor must be credited strictly on QC PASSED pieces only', async () => {
    // Ticket 1: 500 submitted (450 passed, 50 defective) at 9.50/pc = 4275.00
    await laborService.createPieceWorkTicket(
      {
        orderId: 'order-01',
        employeeId: 'emp-piece-01',
        operationName: 'Collar Attachment',
        piecesSubmitted: 500,
        qcPassedPieces: 450,
        defectivePieces: 50,
        ratePerPiece: 9.5,
        workDate: '2026-10-10',
      },
      mockUserAccountsExecutive,
    );

    // Ticket 2: 200 submitted (190 passed, 10 defective) at 12.00/pc = 2280.00
    await laborService.createPieceWorkTicket(
      {
        orderId: 'order-01',
        employeeId: 'emp-piece-01',
        operationName: 'Side Seam Overlock',
        piecesSubmitted: 200,
        qcPassedPieces: 190,
        defectivePieces: 10,
        ratePerPiece: 12.0,
        workDate: '2026-10-15',
      },
      mockUserAccountsExecutive,
    );

    // Calculate payroll
    const result = await payrollService.calculatePeriodPayroll('period-2026-10', mockUserAccountsExecutive);
    expect(result.slipsCount).toBe(3);

    const tailorSlip = slipsDb.find((s) => s.employeeId === 'emp-piece-01');
    expect(tailorSlip.wageModel).toBe(WageModel.PIECE_RATE);
    // 450 * 9.50 (4275) + 190 * 12.00 (2280) = 6555.00
    expect(tailorSlip.basicOrPiecePay.toString()).toBe('6555');
    expect(tailorSlip.grossPay.toString()).toBe('6555');
    expect(tailorSlip.netPayable.toString()).toBe('6555');
  });

  it('2. Hourly line helper wage calculation with 1.5x overtime multiplier', async () => {
    // Helper logs 20 days: 8 hrs regular each = 160 hrs, plus 20 overtime hrs
    attendanceDb.push({
      employeeId: 'emp-hourly-02',
      workDate: new Date('2026-10-10'),
      totalHours: new Prisma.Decimal(180),
      overtimeHours: new Prisma.Decimal(20),
      status: 'PRESENT',
    });

    await payrollService.calculatePeriodPayroll('period-2026-10', mockUserAccountsExecutive);

    const helperSlip = slipsDb.find((s) => s.employeeId === 'emp-hourly-02');
    expect(helperSlip.wageModel).toBe(WageModel.HOURLY_WAGE);

    // Regular pay: 160 hrs * 90/hr = 14400.00
    expect(helperSlip.basicOrPiecePay.toString()).toBe('14400');
    // Overtime pay: 20 hrs * 90/hr * 1.5 = 2700.00
    expect(helperSlip.overtimePay.toString()).toBe('2700');
    // Gross: 14400 + 2700 = 17100.00
    expect(helperSlip.grossPay.toString()).toBe('17100');
  });

  it('3. Salaried staff prorated attendance calculation & statutory PF deduction', async () => {
    // Dinesh Master: base 39,000 / 26 days = 1500/day. Present for 24 days. 8 hours OT.
    attendanceDb.push({
      employeeId: 'emp-salaried-03',
      workDate: new Date('2026-10-05'),
      totalHours: new Prisma.Decimal(192),
      overtimeHours: new Prisma.Decimal(8),
      status: 'PRESENT',
    });
    // Add remaining 23 days of present records
    for (let i = 6; i <= 28; i++) {
      attendanceDb.push({
        employeeId: 'emp-salaried-03',
        workDate: new Date(`2026-10-${i < 10 ? '0' + i : i}`),
        totalHours: new Prisma.Decimal(8),
        overtimeHours: new Prisma.Decimal(0),
        status: 'PRESENT',
      });
    }

    await payrollService.calculatePeriodPayroll('period-2026-10', mockUserAccountsExecutive);

    const salariedSlip = slipsDb.find((s) => s.employeeId === 'emp-salaried-03');
    expect(salariedSlip.wageModel).toBe(WageModel.MONTHLY_SALARIED);

    // 24 days * 1500 = 36000.00 basic
    expect(salariedSlip.basicOrPiecePay.toString()).toBe('36000');
    // 8 hrs OT: 8 * (1500 / 8) * 1.5 = 2250.00
    expect(salariedSlip.overtimePay.toString()).toBe('2250');
    // Gross: 36000 + 2250 = 38250.00
    expect(salariedSlip.grossPay.toString()).toBe('38250');
    // PF deduction (capped at 1800)
    expect(salariedSlip.pfDeduction.toString()).toBe('1800');
    // Net: 38250 - 1800 = 36450.00
    expect(salariedSlip.netPayable.toString()).toBe('36450');
  });

  it('4. Duplicate payroll prevention: recalculating does NOT create duplicate slips', async () => {
    await payrollService.calculatePeriodPayroll('period-2026-10', mockUserAccountsExecutive);
    const firstCount = slipsDb.length;

    // Recalculate same period
    await payrollService.calculatePeriodPayroll('period-2026-10', mockUserAccountsExecutive);
    const secondCount = slipsDb.length;

    // Must be identical length (upserted in place, no duplicate slips!)
    expect(secondCount).toBe(firstCount);
  });

  it('5. Period locking: locked payroll prevents further recalculation', async () => {
    await payrollService.calculatePeriodPayroll('period-2026-10', mockUserAccountsExecutive);

    // Lock the period
    const lockedPeriod = await payrollService.lockPayrollPeriod('period-2026-10', mockUserAccountsExecutive);
    expect(lockedPeriod.status).toBe(PayrollStatus.LOCKED);
    expect(slipsDb.every((s) => s.isLocked)).toBe(true);

    // Attempting to recalculate a locked period must fail
    await expect(
      payrollService.calculatePeriodPayroll('period-2026-10', mockUserAccountsExecutive),
    ).rejects.toThrow(BadRequestException);
  });

  it('6. Itemized payslip: returns detailed piece-work operation breakdown', async () => {
    pieceTicketsDb.push({
      employeeId: 'emp-piece-01',
      operationName: 'Pocket Attach',
      piecesSubmitted: 300,
      qcPassedPieces: 280,
      defectivePieces: 20,
      ratePerPiece: 8.0,
      grossAmount: new Prisma.Decimal(2240),
      workDate: new Date('2026-10-12'),
    });

    await payrollService.calculatePeriodPayroll('period-2026-10', mockUserAccountsExecutive);
    const slip = slipsDb.find((s) => s.employeeId === 'emp-piece-01');

    const itemized = await payrollService.getItemizedPayslip(slip.id);
    expect(itemized.employee.employeeCode).toBe('EMP-T01');
    expect(itemized.pieceWorkDetails.length).toBe(1);
    expect(itemized.pieceWorkDetails[0].operation).toBe('Pocket Attach');
    expect(itemized.pieceWorkDetails[0].qcPassedPieces).toBe(280);
    expect(itemized.pieceWorkDetails[0].defectivePieces).toBe(20);
    expect(itemized.pieceWorkDetails[0].totalEarned.toString()).toBe('2240');
  });
});
