import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Prisma } from '@prisma/client';

export interface JournalLineDto {
  accountCode: string;
  accountName: string;
  debitAmount: number | Prisma.Decimal;
  creditAmount: number | Prisma.Decimal;
}

export interface CreateJournalEntryDto {
  voucherNumber: string;
  date: Date;
  narration: string;
  referenceType: string;
  referenceId?: string;
  lines: JournalLineDto[];
}

@Injectable()
export class AccountsService {
  constructor(private prisma: PrismaService) {}

  async createJournalEntry(dto: CreateJournalEntryDto, prismaClient: any = this.prisma) {
    let totalDebit = new Prisma.Decimal(0);
    let totalCredit = new Prisma.Decimal(0);

    const formattedLines = dto.lines.map((l) => {
      const debit = new Prisma.Decimal(l.debitAmount);
      const credit = new Prisma.Decimal(l.creditAmount);
      totalDebit = totalDebit.add(debit);
      totalCredit = totalCredit.add(credit);
      return {
        accountCode: l.accountCode,
        accountName: l.accountName,
        debitAmount: debit,
        creditAmount: credit,
      };
    });

    // STRICT DOUBLE-ENTRY BALANCING GUARANTEE
    if (!totalDebit.equals(totalCredit)) {
      throw new BadRequestException(
        `Double-Entry Balancing Error: Total Debit (${totalDebit}) does not equal Total Credit (${totalCredit}). Balanced entry required.`,
      );
    }

    return prismaClient.journalEntry.create({
      data: {
        voucherNumber: dto.voucherNumber,
        date: dto.date,
        narration: dto.narration,
        referenceType: dto.referenceType,
        referenceId: dto.referenceId,
        lines: {
          create: formattedLines,
        },
      },
      include: {
        lines: true,
      },
    });
  }

  async getLedgerEntries(limit = 100) {
    return this.prisma.journalEntry.findMany({
      take: limit,
      orderBy: { date: 'desc' },
      include: { lines: true },
    });
  }
}
