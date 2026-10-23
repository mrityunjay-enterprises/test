import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateCutReportDto } from './dto/create-cut-report.dto';
import { LogStitchingEndlineDto } from './dto/log-stitching-endline.dto';
import { UpdateFinishingStageDto } from './dto/update-finishing-stage.dto';
import { AuditService } from '../audit/audit.service';
import { Prisma, WorkflowStage, WorkstationNode } from '@prisma/client';

@Injectable()
export class ProductionService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async generateCutOrderReport(
    dto: CreateCutReportDto,
    user: { id: string; fullName: string; roleType: string; assignedNode?: WorkstationNode },
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
      include: { sizeBreakups: true },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${dto.orderId} not found`);
    }

    const existingReport = await this.prisma.cutOrderReport.findUnique({
      where: { reportNumber: dto.reportNumber },
    });
    if (existingReport) {
      throw new BadRequestException(`Cut Report ${dto.reportNumber} already exists`);
    }

    // Precise consumption and wastage calculations
    const actualFabDecimal = new Prisma.Decimal(dto.actualFabMeters);
    const consumptionPerPc = actualFabDecimal.div(dto.totalPiecesCut);

    const plannedFabMeters = new Prisma.Decimal(dto.targetConsumptionPerPc).mul(dto.totalPiecesCut);
    const wastageDiff = actualFabDecimal.sub(plannedFabMeters);
    const wastagePercent = plannedFabMeters.isZero()
      ? new Prisma.Decimal(0)
      : wastageDiff.div(plannedFabMeters).mul(100);

    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Create Cut Order Report
      const cutReport = await tx.cutOrderReport.create({
        data: {
          orderId: order.id,
          reportNumber: dto.reportNumber,
          pliesCut: dto.pliesCut,
          totalPiecesCut: dto.totalPiecesCut,
          actualFabMeters: actualFabDecimal,
          consumptionPerPc,
          wastagePercent,
          bundleStartNo: dto.bundleStartNo,
          bundleEndNo: dto.bundleEndNo,
          cuttingMasterName: user.fullName,
        },
      });

      // 2. Generate Barcoded Cut Bundles
      for (const b of dto.bundles) {
        const barcode = `BND-${order.orderNumber}-${b.bundleNumber}`;
        await tx.cutBundle.create({
          data: {
            orderId: order.id,
            bundleNumber: b.bundleNumber,
            sizeName: b.sizeName,
            colorName: b.colorName,
            piecesCount: b.piecesCount,
            barcode,
            currentLocation: 'CUTTING_FLOOR',
          },
        });

        // 3. Update Cut Quantity on OrderSizeBreakup
        await tx.orderSizeBreakup.updateMany({
          where: {
            orderId: order.id,
            sizeName: b.sizeName,
            colorName: b.colorName,
          },
          data: {
            cutQuantity: { increment: b.piecesCount },
          },
        });
      }

      // 4. Update workflow stage if at CUTTING_COMMENCED
      if (order.currentStage === WorkflowStage.CUTTING_COMMENCED) {
        await tx.order.update({
          where: { id: order.id },
          data: { currentStage: WorkflowStage.CUT_ORDER_REPORT_GENERATED },
        });

        await tx.workflowStageHistory.create({
          data: {
            orderId: order.id,
            fromStage: WorkflowStage.CUTTING_COMMENCED,
            toStage: WorkflowStage.CUT_ORDER_REPORT_GENERATED,
            transitionedBy: `${user.fullName} (${user.roleType})`,
            terminalNode: user.assignedNode || WorkstationNode.NODE_04_CUTTING,
            comments: `Generated Cut Report ${dto.reportNumber} with ${dto.bundles.length} bundles`,
          },
        });
      }

      return cutReport;
    });

    await this.auditService.log({
      userId: user.id,
      node: user.assignedNode,
      module: 'PRODUCTION',
      action: 'CREATE_CUT_REPORT',
      entityType: 'CutOrderReport',
      entityId: result.id,
      details: {
        reportNumber: dto.reportNumber,
        totalPiecesCut: dto.totalPiecesCut,
        consumptionPerPc: consumptionPerPc.toString(),
      },
    });

    return result;
  }

  async logStitchingEndline(
    dto: LogStitchingEndlineDto,
    user: { id: string; fullName: string; roleType: string; assignedNode?: WorkstationNode },
  ) {
    const order = await this.prisma.order.findUnique({ where: { id: dto.orderId } });
    if (!order) throw new NotFoundException(`Order with ID ${dto.orderId} not found`);

    // Strict Quality Reconciliation: Inspected == Good + Alteration + Repaired + Damaged
    const balanceTotal = dto.goodPassed + dto.underAlteration + dto.repairedPieces + dto.damagedScrap;
    if (dto.inspectedPieces !== balanceTotal) {
      throw new BadRequestException(
        `Quality Reconciliation Mismatch: Inspected pieces (${dto.inspectedPieces}) does not match sum of Good (${dto.goodPassed}) + Alteration (${dto.underAlteration}) + Repaired (${dto.repairedPieces}) + Damaged (${dto.damagedScrap}) = ${balanceTotal}`,
      );
    }

    const log = await this.prisma.stitchingEndlineLog.create({
      data: {
        orderId: dto.orderId,
        productionLineId: dto.productionLineId,
        inspectedPieces: dto.inspectedPieces,
        goodPassed: dto.goodPassed,
        underAlteration: dto.underAlteration,
        repairedPieces: dto.repairedPieces,
        damagedScrap: dto.damagedScrap,
        inspectorName: user.fullName,
        shiftName: dto.shiftName,
      },
    });

    await this.auditService.log({
      userId: user.id,
      node: user.assignedNode,
      module: 'PRODUCTION',
      action: 'STITCHING_ENDLINE_LOG',
      entityType: 'StitchingEndlineLog',
      entityId: log.id,
      details: {
        line: dto.productionLineId,
        good: dto.goodPassed,
        alteration: dto.underAlteration,
        scrap: dto.damagedScrap,
      },
    });

    return log;
  }

  async updateFinishingStage(
    dto: UpdateFinishingStageDto,
    user: { id: string; fullName: string; roleType: string; assignedNode?: WorkstationNode },
  ) {
    const order = await this.prisma.order.findUnique({ where: { id: dto.orderId } });
    if (!order) throw new NotFoundException(`Order with ID ${dto.orderId} not found`);

    let updateData: any = {};

    switch (dto.stage) {
      case 'STAGE_1_BARTACK_EYELET_BUTTON':
        updateData.bartackButtonPassed = { increment: dto.passedQty };
        break;
      case 'STAGE_2_THREAD_TRIMMING':
        updateData.threadCutPassed = { increment: dto.passedQty };
        break;
      case 'STAGE_3_PRESS_1':
        updateData.press1Passed = { increment: dto.passedQty };
        break;
      case 'STAGE_4_INITIAL_QC_CHECK':
        updateData.initialCheckPassed = { increment: dto.passedQty };
        if (dto.failedQty) updateData.initialCheckFailed = { increment: dto.failedQty };
        if (dto.repairedQty) updateData.repairedToPress = { increment: dto.repairedQty };
        if (dto.damagedQty) updateData.damagedScrapTotal = { increment: dto.damagedQty };
        break;
      case 'STAGE_5_FINAL_PRESS':
        updateData.finalPressPassed = { increment: dto.passedQty };
        break;
      case 'STAGE_6_FINAL_QA_AUDIT':
        updateData.finalQaPassed = { increment: dto.passedQty };
        if (dto.damagedQty) updateData.damagedScrapTotal = { increment: dto.damagedQty };
        break;
    }

    const pipeline = await this.prisma.finishingPipelineLog.upsert({
      where: { orderId: dto.orderId },
      create: {
        orderId: dto.orderId,
        bartackButtonPassed: dto.stage === 'STAGE_1_BARTACK_EYELET_BUTTON' ? dto.passedQty : 0,
        threadCutPassed: dto.stage === 'STAGE_2_THREAD_TRIMMING' ? dto.passedQty : 0,
        press1Passed: dto.stage === 'STAGE_3_PRESS_1' ? dto.passedQty : 0,
        initialCheckPassed: dto.stage === 'STAGE_4_INITIAL_QC_CHECK' ? dto.passedQty : 0,
        initialCheckFailed: dto.failedQty || 0,
        repairedToPress: dto.repairedQty || 0,
        finalPressPassed: dto.stage === 'STAGE_5_FINAL_PRESS' ? dto.passedQty : 0,
        finalQaPassed: dto.stage === 'STAGE_6_FINAL_QA_AUDIT' ? dto.passedQty : 0,
        damagedScrapTotal: dto.damagedQty || 0,
      },
      update: updateData,
    });

    await this.auditService.log({
      userId: user.id,
      node: user.assignedNode,
      module: 'PRODUCTION',
      action: 'UPDATE_FINISHING_STAGE',
      entityType: 'FinishingPipelineLog',
      entityId: pipeline.id,
      details: { stage: dto.stage, passed: dto.passedQty },
    });

    return pipeline;
  }

  async getOrderProductionSummary(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        cutReports: true,
        cutBundles: true,
        endlineLogs: { orderBy: { recordedAt: 'desc' } },
        finishingPipelines: true,
        sizeBreakups: true,
      },
    });

    if (!order) throw new NotFoundException(`Order with ID ${orderId} not found`);

    const stitchingTotals = order.endlineLogs.reduce(
      (acc, log) => {
        acc.inspected += log.inspectedPieces;
        acc.good += log.goodPassed;
        acc.alteration += log.underAlteration;
        acc.repaired += log.repairedPieces;
        acc.scrap += log.damagedScrap;
        return acc;
      },
      { inspected: 0, good: 0, alteration: 0, repaired: 0, scrap: 0 },
    );

    return {
      orderNumber: order.orderNumber,
      totalQuantity: order.totalQuantity,
      cutReports: order.cutReports,
      bundlesCount: order.cutBundles.length,
      stitchingTotals,
      finishingStatus: order.finishingPipelines[0] || null,
      sizeBreakups: order.sizeBreakups,
    };
  }
}
