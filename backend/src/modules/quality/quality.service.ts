import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateFptRecordDto, CreateGptRecordDto, CreateSizeSetApprovalDto } from './dto/quality-records.dto';
import { AuditService } from '../audit/audit.service';
import { WorkstationNode } from '@prisma/client';

@Injectable()
export class QualityService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async recordFpt(dto: CreateFptRecordDto, user: { id: string; fullName: string; assignedNode?: WorkstationNode }) {
    const order = await this.prisma.order.findUnique({ where: { id: dto.orderId } });
    if (!order) throw new NotFoundException(`Order with ID ${dto.orderId} not found`);

    const [fpt] = await this.prisma.$transaction([
      this.prisma.fptRecord.create({
        data: {
          orderId: dto.orderId,
          fabricLotNo: dto.fabricLotNo,
          shrinkageWarp: dto.shrinkageWarp,
          shrinkageWeft: dto.shrinkageWeft,
          rubbingDry: dto.rubbingDry,
          rubbingWet: dto.rubbingWet,
          washingFastness: dto.washingFastness,
          actualGsm: dto.actualGsm,
          status: dto.status,
          remarks: dto.remarks,
          testedBy: user.fullName,
        },
      }),
      this.prisma.order.update({
        where: { id: dto.orderId },
        data: { fptStatus: dto.status },
      }),
    ]);

    await this.auditService.log({
      userId: user.id,
      node: user.assignedNode,
      module: 'QUALITY',
      action: 'RECORD_FPT',
      entityType: 'FptRecord',
      entityId: fpt.id,
      details: { orderId: dto.orderId, status: dto.status, lot: dto.fabricLotNo },
    });

    return fpt;
  }

  async recordGpt(dto: CreateGptRecordDto, user: { id: string; fullName: string; assignedNode?: WorkstationNode }) {
    const order = await this.prisma.order.findUnique({ where: { id: dto.orderId } });
    if (!order) throw new NotFoundException(`Order with ID ${dto.orderId} not found`);

    const [gpt] = await this.prisma.$transaction([
      this.prisma.gptRecord.create({
        data: {
          orderId: dto.orderId,
          washAppearance: dto.washAppearance,
          seamStrengthKg: dto.seamStrengthKg,
          torquePercent: dto.torquePercent,
          status: dto.status,
          remarks: dto.remarks,
          testedBy: user.fullName,
        },
      }),
      this.prisma.order.update({
        where: { id: dto.orderId },
        data: { gptStatus: dto.status },
      }),
    ]);

    await this.auditService.log({
      userId: user.id,
      node: user.assignedNode,
      module: 'QUALITY',
      action: 'RECORD_GPT',
      entityType: 'GptRecord',
      entityId: gpt.id,
      details: { orderId: dto.orderId, status: dto.status },
    });

    return gpt;
  }

  async recordSizeSetApproval(
    dto: CreateSizeSetApprovalDto,
    user: { id: string; fullName: string; assignedNode?: WorkstationNode },
  ) {
    const order = await this.prisma.order.findUnique({ where: { id: dto.orderId } });
    if (!order) throw new NotFoundException(`Order with ID ${dto.orderId} not found`);

    const [sizeSet] = await this.prisma.$transaction([
      this.prisma.sizeSetApproval.create({
        data: {
          orderId: dto.orderId,
          sampleSize: dto.sampleSize,
          buyerComments: dto.buyerComments,
          status: dto.status,
          approvedBy: user.fullName,
          approvedAt: new Date(),
        },
      }),
      this.prisma.order.update({
        where: { id: dto.orderId },
        data: { sizeSetStatus: dto.status },
      }),
    ]);

    await this.auditService.log({
      userId: user.id,
      node: user.assignedNode,
      module: 'QUALITY',
      action: 'SIZE_SET_APPROVAL',
      entityType: 'SizeSetApproval',
      entityId: sizeSet.id,
      details: { orderId: dto.orderId, status: dto.status },
    });

    return sizeSet;
  }

  async getOrderQualityHistory(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        fptRecords: { orderBy: { testedAt: 'desc' } },
        gptRecords: { orderBy: { testedAt: 'desc' } },
        sizeSetApprovals: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!order) throw new NotFoundException(`Order with ID ${orderId} not found`);
    return {
      fptStatus: order.fptStatus,
      gptStatus: order.gptStatus,
      sizeSetStatus: order.sizeSetStatus,
      fptRecords: order.fptRecords,
      gptRecords: order.gptRecords,
      sizeSetApprovals: order.sizeSetApprovals,
    };
  }
}
