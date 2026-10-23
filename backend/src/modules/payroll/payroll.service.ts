import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreatePayrollPeriodDto } from './dto/payroll.dto';
import { AuditService } from '../audit/audit.service';
import { Prisma, PayrollStatus, WageModel, WorkstationNode } from '@prisma/client';

@Injectable()
export class PayrollService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async createPeriod(dto: CreatePayrollPeriodDto) {
    const existing = await this.prisma.payrollPeriod.findUnique({
      where: { periodCode: dto.periodCode },
    });
    if (existing) {
      throw new BadRequestException(`Payroll period ${dto.periodCode} already exists`);
    }

    return this.prisma.payrollPeriod.create({
      data: {
        periodCode: dto.periodCode,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        status: PayrollStatus.DRAFT,
      },
    });
  }

  async calculatePeriodPayroll(
    periodId: string,
    user: { id: string; fullName: string; roleType: string; assignedNode?: WorkstationNode },
  ) {
    const period = await this.prisma.payrollPeriod.findUnique({
      where: { id: periodId },
      include: { payrollSlips: true },
    });

    if (!period) throw new NotFoundException(`Payroll period ${periodId} not found`);

    if (period.status === PayrollStatus.LOCKED || period.status === PayrollStatus.FULLY_PAID) {
      throw new BadRequestException(`Payroll period ${period.periodCode} is LOCKED or PAID. Cannot recalculate.`);
    }

    const employees = await this.prisma.employee.findMany({
      where: { isActive: true },
      include: {
        attendanceLogs: {
          where: {
            workDate: {
              gte: period.startDate,
              lte: period.endDate,
            },
          },
        },
        pieceWorkTickets: {
          where: {
            workDate: {
              gte: period.startDate,
              lte: period.endDate,
            },
          },
        },
      },
    });

    const slips = [];

    for (const emp of employees) {
      let basicOrPiecePay = new Prisma.Decimal(0);
      let overtimePay = new Prisma.Decimal(0);
      let presentDays = new Prisma.Decimal(0);
      let totalOtHours = new Prisma.Decimal(0);

      // Attendance metrics
      for (const att of emp.attendanceLogs) {
        if (att.status === 'PRESENT' || att.status === 'PAID_LEAVE') {
          presentDays = presentDays.add(1);
        } else if (att.status === 'HALF_DAY') {
          presentDays = presentDays.add(0.5);
        }
        totalOtHours = totalOtHours.add(att.overtimeHours);
      }

      // Calculation by Wage Model
      if (emp.wageModel === WageModel.PIECE_RATE) {
        // GOLDEN QUALITY RULE: Piece-rate earnings = sum(qcPassedPieces * ratePerPiece)
        for (const ticket of emp.pieceWorkTickets) {
          basicOrPiecePay = basicOrPiecePay.add(ticket.grossAmount);
        }
      } else if (emp.wageModel === WageModel.HOURLY_WAGE) {
        const hourlyRate = emp.baseHourlyRate || new Prisma.Decimal(0);
        let regularHours = new Prisma.Decimal(0);

        for (const att of emp.attendanceLogs) {
          const reg = att.totalHours.sub(att.overtimeHours);
          if (reg.gt(0)) regularHours = regularHours.add(reg);
        }

        basicOrPiecePay = regularHours.mul(hourlyRate);
        overtimePay = totalOtHours.mul(hourlyRate).mul(1.5);
      } else if (emp.wageModel === WageModel.MONTHLY_SALARIED) {
        const baseSalary = emp.baseSalaryMonthly || new Prisma.Decimal(0);
        const standardWorkingDays = new Prisma.Decimal(26);
        const perDayRate = baseSalary.div(standardWorkingDays);

        basicOrPiecePay = perDayRate.mul(presentDays);

        // Overtime for salaried staff (based on standard 8-hour day)
        const hourlyRate = perDayRate.div(8);
        overtimePay = totalOtHours.mul(hourlyRate).mul(1.5);
      }

      const grossPay = basicOrPiecePay.add(overtimePay);

      // Statutory deductions (PF 12% on basic capped at 1800 if applicable)
      let pfDeduction = new Prisma.Decimal(0);
      if (emp.uanNumber && basicOrPiecePay.gt(0)) {
        const pfCalculated = basicOrPiecePay.mul(0.12);
        pfDeduction = pfCalculated.gt(1800) ? new Prisma.Decimal(1800) : pfCalculated;
      }

      const totalDeductions = pfDeduction;
      const netPayable = grossPay.sub(totalDeductions);

      // Upsert payroll slip strictly preventing duplicates
      const slip = await this.prisma.payrollSlip.upsert({
        where: {
          periodId_employeeId: {
            periodId: period.id,
            employeeId: emp.id,
          },
        },
        create: {
          periodId: period.id,
          employeeId: emp.id,
          wageModel: emp.wageModel,
          presentDays,
          overtimeHours: totalOtHours,
          basicOrPiecePay,
          overtimePay,
          grossPay,
          pfDeduction,
          totalDeductions,
          netPayable,
        },
        update: {
          wageModel: emp.wageModel,
          presentDays,
          overtimeHours: totalOtHours,
          basicOrPiecePay,
          overtimePay,
          grossPay,
          pfDeduction,
          totalDeductions,
          netPayable,
        },
      });

      slips.push(slip);
    }

    // Aggregate totals for the period
    const totalGross = slips.reduce((sum, s) => sum.add(s.grossPay), new Prisma.Decimal(0));
    const totalDeductions = slips.reduce((sum, s) => sum.add(s.totalDeductions), new Prisma.Decimal(0));
    const totalNet = slips.reduce((sum, s) => sum.add(s.netPayable), new Prisma.Decimal(0));

    const updatedPeriod = await this.prisma.payrollPeriod.update({
      where: { id: periodId },
      data: {
        totalGrossPay: totalGross,
        totalDeductions,
        totalNetPay: totalNet,
        status: PayrollStatus.CALCULATED,
      },
    });

    await this.auditService.log({
      userId: user.id,
      node: user.assignedNode,
      module: 'PAYROLL',
      action: 'CALCULATE_PAYROLL',
      entityType: 'PayrollPeriod',
      entityId: periodId,
      details: {
        periodCode: period.periodCode,
        slipsCount: slips.length,
        totalGross: totalGross.toString(),
        totalNet: totalNet.toString(),
      },
    });

    return {
      period: updatedPeriod,
      slipsCount: slips.length,
    };
  }

  async lockPayrollPeriod(
    periodId: string,
    user: { id: string; fullName: string; roleType: string; assignedNode?: WorkstationNode },
  ) {
    const period = await this.prisma.payrollPeriod.findUnique({ where: { id: periodId } });
    if (!period) throw new NotFoundException(`Payroll period ${periodId} not found`);

    if (period.status !== PayrollStatus.CALCULATED) {
      throw new BadRequestException('Payroll period must be in CALCULATED state before locking');
    }

    const [lockedPeriod] = await this.prisma.$transaction([
      this.prisma.payrollPeriod.update({
        where: { id: periodId },
        data: { status: PayrollStatus.LOCKED },
      }),
      this.prisma.payrollSlip.updateMany({
        where: { periodId },
        data: { isLocked: true },
      }),
    ]);

    await this.auditService.log({
      userId: user.id,
      node: user.assignedNode,
      module: 'PAYROLL',
      action: 'LOCK_PAYROLL',
      entityType: 'PayrollPeriod',
      entityId: periodId,
      details: { periodCode: period.periodCode },
    });

    return lockedPeriod;
  }

  async getItemizedPayslip(slipId: string) {
    const slip = await this.prisma.payrollSlip.findUnique({
      where: { id: slipId },
      include: {
        employee: true,
        period: true,
      },
    });

    if (!slip) throw new NotFoundException(`Payroll slip ${slipId} not found`);

    let pieceWorkDetails: any[] = [];
    if (slip.wageModel === WageModel.PIECE_RATE) {
      const tickets = await this.prisma.pieceWorkTicket.findMany({
        where: {
          employeeId: slip.employeeId,
          workDate: {
            gte: slip.period.startDate,
            lte: slip.period.endDate,
          },
        },
        include: { order: { select: { orderNumber: true } } },
      });

      pieceWorkDetails = tickets.map((t) => ({
        orderNumber: t.order.orderNumber,
        operation: t.operationName,
        piecesSubmitted: t.piecesSubmitted,
        qcPassedPieces: t.qcPassedPieces,
        defectivePieces: t.defectivePieces,
        ratePerPiece: t.ratePerPiece,
        totalEarned: t.grossAmount,
      }));
    }

    return {
      slip,
      employee: {
        employeeCode: slip.employee.employeeCode,
        fullName: slip.employee.fullName,
        designation: slip.employee.designation,
        wageModel: slip.employee.wageModel,
        bankName: slip.employee.bankName,
        bankAccountNo: slip.employee.bankAccountNo,
        ifscCode: slip.employee.ifscCode,
      },
      periodCode: slip.period.periodCode,
      pieceWorkDetails,
    };
  }

  async findPeriodSummary(periodId: string) {
    const period = await this.prisma.payrollPeriod.findUnique({
      where: { id: periodId },
      include: {
        payrollSlips: {
          include: {
            employee: {
              select: {
                id: true,
                employeeCode: true,
                fullName: true,
                wageModel: true,
                department: { select: { name: true } },
              },
            },
          },
        },
      },
    });

    if (!period) throw new NotFoundException(`Payroll period ${periodId} not found`);
    return period;
  }
}
