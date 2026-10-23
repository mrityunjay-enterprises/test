import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreatePieceWorkTicketDto, CreateHourlyLogDto } from './dto/labor-records.dto';
import { AuditService } from '../audit/audit.service';
import { Prisma, WorkstationNode } from '@prisma/client';

@Injectable()
export class LaborService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async createPieceWorkTicket(
    dto: CreatePieceWorkTicketDto,
    user: { id: string; fullName: string; assignedNode?: WorkstationNode },
  ) {
    const employee = await this.prisma.employee.findUnique({ where: { id: dto.employeeId } });
    if (!employee) throw new NotFoundException(`Employee ${dto.employeeId} not found`);

    const order = await this.prisma.order.findUnique({ where: { id: dto.orderId } });
    if (!order) throw new NotFoundException(`Order ${dto.orderId} not found`);

    if (dto.piecesSubmitted !== dto.qcPassedPieces + dto.defectivePieces) {
      throw new BadRequestException(
        `Piece Count Mismatch: Submitted (${dto.piecesSubmitted}) must equal Passed (${dto.qcPassedPieces}) + Defective (${dto.defectivePieces})`,
      );
    }

    // GOLDEN RULE: Gross amount is calculated strictly on QC PASSED pieces!
    const rateDecimal = new Prisma.Decimal(dto.ratePerPiece);
    const grossAmount = rateDecimal.mul(dto.qcPassedPieces);

    const ticket = await this.prisma.pieceWorkTicket.create({
      data: {
        orderId: dto.orderId,
        employeeId: dto.employeeId,
        operationName: dto.operationName,
        piecesSubmitted: dto.piecesSubmitted,
        qcPassedPieces: dto.qcPassedPieces,
        defectivePieces: dto.defectivePieces,
        ratePerPiece: rateDecimal,
        grossAmount,
        workDate: new Date(dto.workDate),
        supervisorName: user.fullName,
      },
    });

    await this.auditService.log({
      userId: user.id,
      node: user.assignedNode,
      module: 'LABOR',
      action: 'PIECE_WORK_TICKET',
      entityType: 'PieceWorkTicket',
      entityId: ticket.id,
      details: {
        employee: employee.fullName,
        operation: dto.operationName,
        passed: dto.qcPassedPieces,
        defective: dto.defectivePieces,
        earned: grossAmount.toString(),
      },
    });

    return ticket;
  }

  async createHourlyLog(dto: CreateHourlyLogDto) {
    const employee = await this.prisma.employee.findUnique({ where: { id: dto.employeeId } });
    if (!employee) throw new NotFoundException(`Employee ${dto.employeeId} not found`);

    const rateDecimal = new Prisma.Decimal(dto.hourlyRate);
    const regHoursDecimal = new Prisma.Decimal(dto.regularHours);
    const otHoursDecimal = new Prisma.Decimal(dto.overtimeHours);

    // Regular Pay + Overtime at 1.5x
    const regPay = regHoursDecimal.mul(rateDecimal);
    const otPay = otHoursDecimal.mul(rateDecimal).mul(1.5);
    const totalCost = regPay.add(otPay);

    return this.prisma.hourlyWorkLog.create({
      data: {
        employeeId: dto.employeeId,
        workDate: new Date(dto.workDate),
        lineAllocated: dto.lineAllocated,
        regularHours: regHoursDecimal,
        overtimeHours: otHoursDecimal,
        hourlyRate: rateDecimal,
        otMultiplier: new Prisma.Decimal(1.5),
        totalCost,
      },
    });
  }

  async getOrderLaborCostSummary(orderId: string) {
    const pieceTickets = await this.prisma.pieceWorkTicket.findMany({
      where: { orderId },
      include: { employee: { select: { fullName: true, employeeCode: true } } },
    });

    const totalPieceCost = pieceTickets.reduce(
      (acc, t) => acc.add(t.grossAmount),
      new Prisma.Decimal(0),
    );

    return {
      orderId,
      totalPieceTicketsCount: pieceTickets.length,
      directPieceLaborCost: totalPieceCost,
      tickets: pieceTickets,
    };
  }
}
