import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { BankingService } from '../src/modules/banking/banking.service';
import { AccountsService } from '../src/modules/accounts/accounts.service';
import { MockBankingProvider } from '../src/modules/banking/providers/mock-banking.provider';
import { BANKING_PROVIDER_TOKEN } from '../src/modules/banking/interfaces/banking-provider.interface';
import { PrismaService } from '../src/database/prisma.service';
import { Prisma, WageModel, PayoutStatus, PayrollStatus } from '@prisma/client';

describe('Phase 5: Provider-Independent Banking Integration & General Accounts Ledger', () => {
  let bankingService: BankingService;
  let accountsService: AccountsService;
  let mockBankingProvider: MockBankingProvider;

  let payrollPeriodsDb: Record<string, any> = {};
  let payrollSlipsDb: any[] = [];
  let payoutBatchesDb: Record<string, any> = {};
  let payoutTransactionsDb: any[] = [];
  let journalEntriesDb: any[] = [];
  let journalLinesDb: any[] = [];

  const mockAdminMD = {
    id: 'user-md-01',
    fullName: 'Mrityunjay Pareek (MD)',
    roleType: 'MANAGING_DIRECTOR',
    isSuperAdmin: true,
  };

  const mockNonOwner = {
    id: 'user-sewing-01',
    fullName: 'Sewing Supervisor',
    roleType: 'SEWING_SUPERVISOR',
    isSuperAdmin: false,
  };

  beforeEach(async () => {
    payrollPeriodsDb = {
      'period-locked-01': {
        id: 'period-locked-01',
        periodCode: '2026-10-OCT',
        startDate: new Date('2026-10-01'),
        endDate: new Date('2026-10-31'),
        totalGrossPay: new Prisma.Decimal(55000),
        totalDeductions: new Prisma.Decimal(4680),
        totalNetPay: new Prisma.Decimal(50320),
        status: PayrollStatus.LOCKED,
      },
      'period-draft-02': {
        id: 'period-draft-02',
        periodCode: '2026-11-NOV',
        startDate: new Date('2026-11-01'),
        endDate: new Date('2026-11-30'),
        status: PayrollStatus.DRAFT,
      },
    };

    payrollSlipsDb = [
      {
        id: 'slip-01',
        periodId: 'period-locked-01',
        employeeId: 'emp-01',
        wageModel: WageModel.PIECE_RATE,
        netPayable: new Prisma.Decimal(18500),
        isLocked: true,
        isDisbursed: false,
        employee: {
          id: 'emp-01',
          employeeCode: 'EMP-T01',
          fullName: 'Ramesh Tailor',
          bankAccountNo: '112233445566',
          ifscCode: 'SBIN0001234',
        },
      },
      {
        id: 'slip-02',
        periodId: 'period-locked-01',
        employeeId: 'emp-02',
        wageModel: WageModel.HOURLY_WAGE,
        netPayable: new Prisma.Decimal(12820),
        isLocked: true,
        isDisbursed: false,
        employee: {
          id: 'emp-02',
          employeeCode: 'EMP-H02',
          fullName: 'Suresh Helper',
          bankAccountNo: '998877665544',
          ifscCode: 'HDFC0005678',
        },
      },
      {
        id: 'slip-03',
        periodId: 'period-locked-01',
        employeeId: 'emp-03',
        wageModel: WageModel.MONTHLY_SALARIED,
        netPayable: new Prisma.Decimal(19000),
        isLocked: true,
        isDisbursed: false,
        employee: {
          id: 'emp-03',
          employeeCode: 'EMP-M03',
          fullName: 'Dinesh Pattern Master',
          bankAccountNo: '554433221100',
          ifscCode: 'INVALID_IFSC_TEST', // Will test bank item failure handling
        },
      },
    ];

    payoutBatchesDb = {};
    payoutTransactionsDb = [];
    journalEntriesDb = [];
    journalLinesDb = [];

    const mockPrismaService: any = {
      payrollPeriod: {
        findUnique: jest.fn().mockImplementation(({ where }) => {
          const period = payrollPeriodsDb[where.id];
          if (!period) return null;
          const slips = payrollSlipsDb.filter((s) => s.periodId === period.id);
          return { ...period, payrollSlips: slips };
        }),
        update: jest.fn().mockImplementation(({ where, data }) => {
          if (payrollPeriodsDb[where.id]) {
            Object.assign(payrollPeriodsDb[where.id], data);
            return payrollPeriodsDb[where.id];
          }
          return null;
        }),
      },
      payrollSlip: {
        updateMany: jest.fn().mockImplementation(({ where, data }) => {
          let count = 0;
          for (const s of payrollSlipsDb) {
            if (s.periodId === where.periodId && s.employeeId === where.employeeId) {
              Object.assign(s, data);
              count++;
            }
          }
          return { count };
        }),
        count: jest.fn().mockImplementation(({ where }) => {
          return payrollSlipsDb.filter((s) => {
            if (s.periodId !== where.periodId) return false;
            if (where.isDisbursed !== undefined && s.isDisbursed !== where.isDisbursed) return false;
            if (where.netPayable?.gt !== undefined && !new Prisma.Decimal(s.netPayable).gt(where.netPayable.gt)) return false;
            return true;
          }).length;
        }),
      },
      payoutBatch: {
        create: jest.fn().mockImplementation(({ data, include }) => {
          const id = `batch-${Date.now()}`;
          const txns = data.transactions.create.map((t: any, idx: number) => {
            const txn = {
              id: `txn-${id}-${idx + 1}`,
              batchId: id,
              employeeId: t.employeeId,
              amount: t.amount,
              beneficiaryAcc: t.beneficiaryAcc,
              beneficiaryIfsc: t.beneficiaryIfsc,
              status: t.status,
              attempts: 0,
            };
            payoutTransactionsDb.push(txn);
            return txn;
          });
          const newBatch = {
            id,
            ...data,
            transactions: txns,
            createdAt: new Date(),
          };
          payoutBatchesDb[id] = newBatch;
          return newBatch;
        }),
        findUnique: jest.fn().mockImplementation(({ where }) => {
          const batch = payoutBatchesDb[where.id];
          if (!batch) return null;
          const txns = payoutTransactionsDb
            .filter((t) => t.batchId === batch.id)
            .map((t) => {
              const slip = payrollSlipsDb.find((s) => s.employeeId === t.employeeId);
              return {
                ...t,
                employee: slip ? slip.employee : { fullName: 'Unknown' },
              };
            });
          return {
            ...batch,
            period: payrollPeriodsDb[batch.periodId],
            transactions: txns,
          };
        }),
        update: jest.fn().mockImplementation(({ where, data, include }) => {
          const batch = payoutBatchesDb[where.id];
          if (!batch) return null;
          Object.assign(batch, data);
          if (include?.transactions) {
            batch.transactions = payoutTransactionsDb.filter((t) => t.batchId === batch.id);
          }
          return batch;
        }),
        findMany: jest.fn().mockImplementation(() => Object.values(payoutBatchesDb)),
      },
      payoutTransaction: {
        update: jest.fn().mockImplementation(({ where, data }) => {
          const txn = payoutTransactionsDb.find((t) => t.id === where.id);
          if (!txn) return null;
          if (data.attempts?.increment) {
            txn.attempts = (txn.attempts || 0) + data.attempts.increment;
            delete data.attempts;
          }
          Object.assign(txn, data);
          return txn;
        }),
      },
      journalEntry: {
        create: jest.fn().mockImplementation(({ data }) => {
          const id = `je-${Date.now()}`;
          const lines = data.lines.create.map((l: any, idx: number) => ({
            id: `line-${id}-${idx}`,
            journalEntryId: id,
            ...l,
          }));
          journalLinesDb.push(...lines);
          const entry = {
            id,
            voucherNumber: data.voucherNumber,
            date: data.date,
            narration: data.narration,
            referenceType: data.referenceType,
            referenceId: data.referenceId,
            lines,
            createdAt: new Date(),
          };
          journalEntriesDb.push(entry);
          return entry;
        }),
        findMany: jest.fn().mockImplementation(() => journalEntriesDb),
      },
      $transaction: jest.fn().mockImplementation(async (callback) => {
        return callback(mockPrismaService);
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BankingService,
        AccountsService,
        {
          provide: BANKING_PROVIDER_TOKEN,
          useClass: MockBankingProvider,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    bankingService = module.get<BankingService>(BankingService);
    accountsService = module.get<AccountsService>(AccountsService);
    mockBankingProvider = module.get<MockBankingProvider>(BANKING_PROVIDER_TOKEN);
  });

  describe('1. Payout Batch Creation & Validation', () => {
    it('should successfully create a payout batch from locked payroll slips', async () => {
      const result = await bankingService.createPayoutBatch(
        { periodId: 'period-locked-01' },
        mockAdminMD.id,
        mockAdminMD.fullName,
      );

      expect(result).toBeDefined();
      expect(result.totalEmployees).toBe(3);
      expect(new Prisma.Decimal(result.totalAmount).toNumber()).toBe(50320);
      expect(result.status).toBe('CREATED');
      expect(result.transactions).toHaveLength(3);
      expect(result.idempotencyKey).toContain('IDEMP-period-locked-01');
      expect(payrollPeriodsDb['period-locked-01'].status).toBe(PayrollStatus.DISBURSEMENT_INITIATED);
    });

    it('should reject payout batch creation if payroll period is in DRAFT status', async () => {
      await expect(
        bankingService.createPayoutBatch(
          { periodId: 'period-draft-02' },
          mockAdminMD.id,
          mockAdminMD.fullName,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject payout batch creation if any employee lacks bank account or IFSC', async () => {
      // Modify employee to remove IFSC
      payrollSlipsDb[0].employee.ifscCode = null;

      await expect(
        bankingService.createPayoutBatch(
          { periodId: 'period-locked-01' },
          mockAdminMD.id,
          mockAdminMD.fullName,
        ),
      ).rejects.toThrow(/Missing bank information/);
    });
  });

  describe('2. Multi-Owner 2-Man Approval Sign-off', () => {
    it('should allow Super Admin / MD to approve a payout batch', async () => {
      const batch = await bankingService.createPayoutBatch(
        { periodId: 'period-locked-01' },
        'acc-exec-01',
        'Accounts Executive',
      );

      const approved = await bankingService.approvePayoutBatch(
        batch.id,
        { comments: 'Verified and approved for NEFT/RTGS batch transfer' },
        mockAdminMD,
      );

      expect(approved.approvedById).toBe(mockAdminMD.id);
      expect(approved.approvedBy).toBe(mockAdminMD.fullName);
    });

    it('should reject payout batch approval by non-owner roles (e.g. Sewing Supervisor)', async () => {
      const batch = await bankingService.createPayoutBatch(
        { periodId: 'period-locked-01' },
        'acc-exec-01',
        'Accounts Executive',
      );

      await expect(
        bankingService.approvePayoutBatch(
          batch.id,
          { comments: 'Attempted unauthorized approval' },
          mockNonOwner,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('3. Payout Batch Submission & Dual-Outcome Handling', () => {
    it('should submit batch to corporate banking gateway and process individual transaction statuses', async () => {
      const batch = await bankingService.createPayoutBatch(
        { periodId: 'period-locked-01' },
        mockAdminMD.id,
        mockAdminMD.fullName,
      );

      const submissionResult = await bankingService.submitPayoutBatch(batch.id);

      expect(submissionResult).toBeDefined();
      expect(submissionResult.journalEntryId).toBeDefined();

      const updatedBatch = await bankingService.getPayoutBatchById(batch.id);
      expect(updatedBatch.status).toBe('PROCESSING'); // 2 passed, 1 failed due to INVALID_IFSC_TEST

      // Transaction 1 (Ramesh) -> Success
      const txn1 = updatedBatch.transactions.find((t) => t.employeeId === 'emp-01');
      expect(txn1?.status).toBe('SUCCESS');
      expect(txn1?.utrNumber).toContain('UTR-MOCK-202610-');

      // Transaction 2 (Suresh) -> Success
      const txn2 = updatedBatch.transactions.find((t) => t.employeeId === 'emp-02');
      expect(txn2?.status).toBe('SUCCESS');

      // Transaction 3 (Dinesh with invalid IFSC) -> Failed
      const txn3 = updatedBatch.transactions.find((t) => t.employeeId === 'emp-03');
      expect(txn3?.status).toBe('FAILED');
      expect(txn3?.errorCode).toBe('INVALID_IFSC_CODE');

      // Slips 1 and 2 should be marked disbursed, slip 3 undisbursed
      expect(payrollSlipsDb.find((s) => s.employeeId === 'emp-01').isDisbursed).toBe(true);
      expect(payrollSlipsDb.find((s) => s.employeeId === 'emp-02').isDisbursed).toBe(true);
      expect(payrollSlipsDb.find((s) => s.employeeId === 'emp-03').isDisbursed).toBe(false);

      // Period status should be PARTIALLY_DISBURSED because slip 3 failed
      expect(payrollPeriodsDb['period-locked-01'].status).toBe('PARTIALLY_DISBURSED');
    });

    it('should guarantee idempotency on duplicate batch submissions without double-payouts', async () => {
      const batch = await bankingService.createPayoutBatch(
        { periodId: 'period-locked-01' },
        mockAdminMD.id,
        mockAdminMD.fullName,
      );

      // First submission
      await bankingService.submitPayoutBatch(batch.id);

      // Second duplicate submission attempt
      const duplicateSubmission = await bankingService.submitPayoutBatch(batch.id);
      expect(duplicateSubmission).toBeDefined();

      // No additional journal entries created
      expect(journalEntriesDb.length).toBe(1);
    });
  });

  describe('4. Automated Double-Entry General Ledger Verification', () => {
    it('should generate a strictly balanced double-entry journal entry upon salary payout', async () => {
      const batch = await bankingService.createPayoutBatch(
        { periodId: 'period-locked-01' },
        mockAdminMD.id,
        mockAdminMD.fullName,
      );

      await bankingService.submitPayoutBatch(batch.id);

      expect(journalEntriesDb).toHaveLength(1);
      const je = journalEntriesDb[0];
      expect(je.voucherNumber).toContain(`VCH-PAYROLL-${batch.batchNumber}`);
      expect(je.lines).toHaveLength(2);

      const debitLine = je.lines.find((l: any) => l.accountCode === '2100');
      const creditLine = je.lines.find((l: any) => l.accountCode === '1010');

      expect(debitLine).toBeDefined();
      expect(creditLine).toBeDefined();

      // Amount: 18500 + 12820 = 31320 (successful disbursements)
      expect(new Prisma.Decimal(debitLine.debitAmount).toNumber()).toBe(31320);
      expect(new Prisma.Decimal(creditLine.creditAmount).toNumber()).toBe(31320);

      // Double-entry guarantee: Total Debit === Total Credit
      expect(new Prisma.Decimal(debitLine.debitAmount).equals(creditLine.creditAmount)).toBe(true);
    });

    it('should strictly reject any imbalanced journal entry in AccountsService', async () => {
      await expect(
        accountsService.createJournalEntry({
          voucherNumber: 'VCH-TEST-IMBALANCED',
          date: new Date(),
          narration: 'Erroneous manual entry without credit match',
          referenceType: 'MANUAL',
          lines: [
            {
              accountCode: '2100',
              accountName: 'Salaries Payable',
              debitAmount: 5000,
              creditAmount: 0,
            },
            {
              accountCode: '1010',
              accountName: 'Bank Account',
              debitAmount: 0,
              creditAmount: 4900, // Imbalance of 100!
            },
          ],
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('5. Batch Reconciliation', () => {
    it('should successfully reconcile batch status with provider', async () => {
      const batch = await bankingService.createPayoutBatch(
        { periodId: 'period-locked-01' },
        mockAdminMD.id,
        mockAdminMD.fullName,
      );

      await bankingService.submitPayoutBatch(batch.id);

      const recon = await bankingService.reconcilePayoutBatch(batch.id);
      expect(recon.batchId).toBe(batch.id);
      expect(recon.reconciliationStatus).toBe('RECONCILED');
      expect(recon.itemsCount).toBe(3);
    });
  });
});
