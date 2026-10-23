import {
  Injectable,
  Inject,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AccountsService } from '../accounts/accounts.service';
import {
  IBankingProvider,
  BANKING_PROVIDER_TOKEN,
  PayoutBatchRequest,
} from './interfaces/banking-provider.interface';
import { CreatePayoutBatchDto, ApprovePayoutBatchDto } from './dto/banking.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class BankingService {
  private readonly logger = new Logger(BankingService.name);

  constructor(
    private prisma: PrismaService,
    private accountsService: AccountsService,
    @Inject(BANKING_PROVIDER_TOKEN)
    private bankingProvider: IBankingProvider,
  ) {}

  /**
   * 1. Create a Payout Batch from a locked payroll period
   */
  async createPayoutBatch(
    dto: CreatePayoutBatchDto,
    userId: string,
    userName: string,
  ) {
    const period = await this.prisma.payrollPeriod.findUnique({
      where: { id: dto.periodId },
      include: {
        payrollSlips: {
          include: {
            employee: true,
          },
        },
      },
    });

    if (!period) {
      throw new NotFoundException(`Payroll period ${dto.periodId} not found`);
    }

    if (period.status !== 'LOCKED' && period.status !== 'CALCULATED') {
      throw new BadRequestException(
        `Cannot create payout batch for period in status '${period.status}'. Period must be 'LOCKED' first.`,
      );
    }

    // Filter undisbursed slips with net payable > 0
    const pendingSlips = period.payrollSlips.filter(
      (s) => !s.isDisbursed && new Prisma.Decimal(s.netPayable).gt(0),
    );

    if (pendingSlips.length === 0) {
      throw new BadRequestException(
        `No undisbursed payroll slips with payable amounts found in period ${period.periodCode}`,
      );
    }

    // Validate bank details for all employees in batch
    const missingBankDetails: string[] = [];
    for (const slip of pendingSlips) {
      if (!slip.employee.bankAccountNo || !slip.employee.ifscCode) {
        missingBankDetails.push(
          `${slip.employee.employeeCode} (${slip.employee.fullName}) lacks bank account or IFSC`,
        );
      }
    }

    if (missingBankDetails.length > 0) {
      throw new BadRequestException(
        `Payout batch creation rejected. Missing bank information for employees: ${missingBankDetails.join(', ')}`,
      );
    }

    let totalAmount = new Prisma.Decimal(0);
    for (const slip of pendingSlips) {
      totalAmount = totalAmount.add(new Prisma.Decimal(slip.netPayable));
    }

    const batchNumber = `PAYOUT-${period.periodCode}-${Date.now().toString().slice(-6)}`;
    const idempotencyKey = `IDEMP-${period.id}-${Date.now()}`;
    const bankProvider = dto.bankProvider || 'MOCK_CORPORATE_H2H';

    return this.prisma.$transaction(async (tx) => {
      const batch = await tx.payoutBatch.create({
        data: {
          batchNumber,
          periodId: period.id,
          bankProvider,
          totalEmployees: pendingSlips.length,
          totalAmount,
          status: 'CREATED',
          idempotencyKey,
          approvedById: userId,
          approvedBy: userName,
          transactions: {
            create: pendingSlips.map((s) => ({
              employeeId: s.employeeId,
              amount: s.netPayable,
              beneficiaryAcc: s.employee.bankAccountNo!,
              beneficiaryIfsc: s.employee.ifscCode!,
              status: 'CREATED',
            })),
          },
        },
        include: {
          transactions: true,
        },
      });

      // Link payout transaction IDs to payroll slips
      for (const txn of batch.transactions) {
        await tx.payrollSlip.updateMany({
          where: {
            periodId: period.id,
            employeeId: txn.employeeId,
          },
          data: {
            payoutTxnId: txn.id,
          },
        });
      }

      await tx.payrollPeriod.update({
        where: { id: period.id },
        data: { status: 'DISBURSEMENT_INITIATED' },
      });

      return batch;
    });
  }

  /**
   * 2. Approve Payout Batch (Multi-Owner / Super Admin sign-off)
   */
  async approvePayoutBatch(
    batchId: string,
    dto: ApprovePayoutBatchDto,
    user: { id: string; fullName: string; isSuperAdmin?: boolean; roleType?: string },
  ) {
    const isOwner =
      user.isSuperAdmin ||
      ['MANAGING_DIRECTOR', 'DIRECTOR_PARTNER', 'GENERAL_MANAGER'].includes(
        user.roleType || '',
      );

    if (!isOwner) {
      throw new BadRequestException(
        'Only Factory Owners (MD, Partner, GM) or Super Admins are authorized to approve payout batches.',
      );
    }

    const batch = await this.prisma.payoutBatch.findUnique({
      where: { id: batchId },
    });

    if (!batch) {
      throw new NotFoundException(`Payout batch ${batchId} not found`);
    }

    return this.prisma.payoutBatch.update({
      where: { id: batchId },
      data: {
        approvedById: user.id,
        approvedBy: user.fullName,
      },
      include: { transactions: true },
    });
  }

  /**
   * 3. Submit Payout Batch to Banking Gateway
   */
  async submitPayoutBatch(batchId: string) {
    const batch = await this.prisma.payoutBatch.findUnique({
      where: { id: batchId },
      include: {
        period: true,
        transactions: {
          include: {
            employee: true,
          },
        },
      },
    });

    if (!batch) {
      throw new NotFoundException(`Payout batch ${batchId} not found`);
    }

    if (batch.status === 'SUCCESS') {
      return {
        message: 'Payout batch is already completed and fully disbursed',
        batch,
      };
    }

    // Filter pending transactions to submit (or retry)
    const pendingTxns = batch.transactions.filter(
      (t) => t.status === 'CREATED' || t.status === 'FAILED',
    );

    if (pendingTxns.length === 0) {
      return {
        message: 'No pending transactions to submit for this batch',
        batch,
      };
    }

    const request: PayoutBatchRequest = {
      batchId: batch.id,
      batchNumber: batch.batchNumber,
      idempotencyKey: batch.idempotencyKey,
      instructions: pendingTxns.map((t) => ({
        transactionId: t.id,
        beneficiaryAccountNo: t.beneficiaryAcc,
        beneficiaryIfsc: t.beneficiaryIfsc,
        beneficiaryName: t.employee.fullName,
        amount: new Prisma.Decimal(t.amount),
      })),
    };

    // Mark batch as SUBMITTED before external call to prevent duplicate submissions
    await this.prisma.payoutBatch.update({
      where: { id: batch.id },
      data: { status: 'SUBMITTED' },
    });

    // Call banking provider
    const providerResponse = await this.bankingProvider.submitBulkPayout(request);

    // Apply results in database
    let totalDisbursed = new Prisma.Decimal(0);
    let successCount = 0;
    let failedCount = 0;

    for (const item of providerResponse.itemResults) {
      const txn = batch.transactions.find((t) => t.id === item.transactionId);
      if (!txn) continue;

      const isSuccess = item.status === 'SUCCESS';
      if (isSuccess) {
        totalDisbursed = totalDisbursed.add(new Prisma.Decimal(txn.amount));
        successCount++;
      } else {
        failedCount++;
      }

      await this.prisma.payoutTransaction.update({
        where: { id: txn.id },
        data: {
          status: item.status as any,
          utrNumber: item.utrNumber,
          bankReference: item.bankReference,
          errorCode: item.errorCode,
          errorMessage: item.errorMessage,
          attempts: { increment: 1 },
          disbursedAt: isSuccess ? new Date() : null,
        },
      });

      if (isSuccess) {
        await this.prisma.payrollSlip.updateMany({
          where: {
            periodId: batch.periodId,
            employeeId: txn.employeeId,
          },
          data: {
            isDisbursed: true,
          },
        });
      }
    }

    const totalItems = batch.transactions.length;
    let finalBatchStatus: 'SUCCESS' | 'PROCESSING' | 'FAILED' = 'PROCESSING';
    if (successCount === totalItems) {
      finalBatchStatus = 'SUCCESS';
    } else if (failedCount === totalItems) {
      finalBatchStatus = 'FAILED';
    }

    // Double-Entry Ledger Posting: Automatically post journal entry for disbursed salaries
    let createdJournalEntryId: string | null = batch.journalEntryId;
    if (totalDisbursed.gt(0) && !createdJournalEntryId) {
      const journalEntry = await this.accountsService.createJournalEntry({
        voucherNumber: `VCH-PAYROLL-${batch.batchNumber}`,
        date: new Date(),
        narration: `Direct Bank Salary Disbursement for ${batch.period.periodCode} via ${batch.bankProvider}. Total disbursed: INR ${totalDisbursed.toFixed(2)}`,
        referenceType: 'PAYOUT_BATCH',
        referenceId: batch.id,
        lines: [
          {
            accountCode: '2100',
            accountName: 'Salaries & Wages Payable',
            debitAmount: totalDisbursed,
            creditAmount: 0,
          },
          {
            accountCode: '1010',
            accountName: 'Corporate Operations Bank Account',
            debitAmount: 0,
            creditAmount: totalDisbursed,
          },
        ],
      });
      createdJournalEntryId = journalEntry.id;
    }

    const updatedBatch = await this.prisma.payoutBatch.update({
      where: { id: batch.id },
      data: {
        status: finalBatchStatus as any,
        journalEntryId: createdJournalEntryId,
      },
      include: {
        transactions: true,
      },
    });

    // Check if entire period is now fully disbursed
    const remainingSlips = await this.prisma.payrollSlip.count({
      where: {
        periodId: batch.periodId,
        isDisbursed: false,
        netPayable: { gt: 0 },
      },
    });

    await this.prisma.payrollPeriod.update({
      where: { id: batch.periodId },
      data: {
        status: remainingSlips === 0 ? 'FULLY_PAID' : 'PARTIALLY_DISBURSED',
      },
    });

    return {
      message: `Batch submission completed. ${successCount} transfers successful, ${failedCount} failed.`,
      batch: updatedBatch,
      journalEntryId: createdJournalEntryId,
    };
  }

  /**
   * 4. Reconcile Payout Batch with Bank Provider
   */
  async reconcilePayoutBatch(batchId: string) {
    const batch = await this.prisma.payoutBatch.findUnique({
      where: { id: batchId },
      include: { transactions: true },
    });

    if (!batch) {
      throw new NotFoundException(`Payout batch ${batchId} not found`);
    }

    const recon = await this.bankingProvider.queryBatchStatus(
      batch.id,
      batch.idempotencyKey,
    );

    for (const item of recon.itemResults) {
      await this.prisma.payoutTransaction.update({
        where: { id: item.transactionId },
        data: {
          status: item.status as any,
          utrNumber: item.utrNumber,
          bankReference: item.bankReference,
          errorCode: item.errorCode,
          errorMessage: item.errorMessage,
        },
      });
    }

    return {
      batchId,
      reconciliationStatus: recon.status,
      itemsCount: recon.itemResults.length,
    };
  }

  async getPayoutBatches() {
    return this.prisma.payoutBatch.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        period: true,
        transactions: true,
      },
    });
  }

  async getPayoutBatchById(batchId: string) {
    const batch = await this.prisma.payoutBatch.findUnique({
      where: { id: batchId },
      include: {
        period: true,
        transactions: {
          include: {
            employee: true,
          },
        },
      },
    });

    if (!batch) {
      throw new NotFoundException(`Payout batch ${batchId} not found`);
    }

    return batch;
  }
}
