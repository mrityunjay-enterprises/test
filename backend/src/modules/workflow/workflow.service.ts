import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { WorkflowStage, QualityGateStatus, WorkstationNode } from '@prisma/client';
import { AuditService } from '../audit/audit.service';

export const WORKFLOW_STAGES_SEQUENCE: WorkflowStage[] = [
  WorkflowStage.ORDER_CONFIRMED,
  WorkflowStage.FABRIC_INWARD_GRN,
  WorkflowStage.FPT_TESTING,
  WorkflowStage.PPE_GPT_TESTING,
  WorkflowStage.SIZE_SET_SAMPLE_APPROVAL,
  WorkflowStage.CUTTING_COMMENCED,
  WorkflowStage.RAW_MATERIAL_ISSUED,
  WorkflowStage.CUT_DOWN_COMPLETED,
  WorkflowStage.CUT_ORDER_REPORT_GENERATED,
  WorkflowStage.STITCHING_LINE_ALLOCATED,
  WorkflowStage.STITCHING_ENDLINE_CHECKING,
  WorkflowStage.STITCHING_ALTERATION_REPAIR,
  WorkflowStage.STITCHING_DAMAGED_SCRAP,
  WorkflowStage.FINISHING_FLOOR_RECEIVED,
  WorkflowStage.STAGE_1_BARTACK_EYELET_BUTTON,
  WorkflowStage.STAGE_2_THREAD_TRIMMING,
  WorkflowStage.STAGE_3_PRESS_1,
  WorkflowStage.STAGE_4_INITIAL_QC_CHECK,
  WorkflowStage.STAGE_5_FINAL_PRESS,
  WorkflowStage.STAGE_6_FINAL_QA_AUDIT,
  WorkflowStage.PACKING_AND_CARTONING,
  WorkflowStage.DISPATCH_AND_SHIPPING,
];

@Injectable()
export class WorkflowService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  getSequence(): WorkflowStage[] {
    return WORKFLOW_STAGES_SEQUENCE;
  }

  getNextStage(currentStage: WorkflowStage, sizeSetRequired = true): WorkflowStage | null {
    const currentIndex = WORKFLOW_STAGES_SEQUENCE.indexOf(currentStage);
    if (currentIndex === -1 || currentIndex === WORKFLOW_STAGES_SEQUENCE.length - 1) {
      return null;
    }

    // Branching Rule: If Size Set is waived/not required, jump directly from PPE_GPT_TESTING to CUTTING_COMMENCED
    if (currentStage === WorkflowStage.PPE_GPT_TESTING && !sizeSetRequired) {
      return WorkflowStage.CUTTING_COMMENCED;
    }

    return WORKFLOW_STAGES_SEQUENCE[currentIndex + 1];
  }

  async advanceOrderWorkflow(
    orderId: string,
    nextStage: WorkflowStage,
    user: { id: string; fullName: string; roleType: string; assignedNode?: WorkstationNode },
    comments?: string,
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        fptRecords: { orderBy: { testedAt: 'desc' }, take: 1 },
        gptRecords: { orderBy: { testedAt: 'desc' }, take: 1 },
        sizeSetApprovals: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    const currentIndex = WORKFLOW_STAGES_SEQUENCE.indexOf(order.currentStage);
    const targetIndex = WORKFLOW_STAGES_SEQUENCE.indexOf(nextStage);

    if (targetIndex === -1) {
      throw new BadRequestException(`Invalid target workflow stage: ${nextStage}`);
    }

    // ----------------- QUALITY GATE 1: FPT CHECK -----------------
    // Advancing to or beyond PPE_GPT_TESTING requires FPT PASSED
    const fptMilestoneIndex = WORKFLOW_STAGES_SEQUENCE.indexOf(WorkflowStage.FPT_TESTING);
    if (currentIndex >= fptMilestoneIndex && targetIndex > fptMilestoneIndex) {
      const latestFpt = order.fptRecords[0];
      const isFptPassed = order.fptStatus === QualityGateStatus.PASSED || latestFpt?.status === QualityGateStatus.PASSED;

      if (!isFptPassed) {
        throw new BadRequestException(
          'Quality Gate Blocker: Cannot advance beyond Fabric Performance Testing. FPT must be PASSED first (shrinkage, rubbing, GSM within buyer tolerance).',
        );
      }
    }

    // ----------------- QUALITY GATE 2: GPT CHECK -----------------
    // Advancing to CUTTING_COMMENCED requires GPT PASSED
    const cuttingIndex = WORKFLOW_STAGES_SEQUENCE.indexOf(WorkflowStage.CUTTING_COMMENCED);
    if (targetIndex >= cuttingIndex) {
      const latestGpt = order.gptRecords[0];
      const isGptPassed = order.gptStatus === QualityGateStatus.PASSED || latestGpt?.status === QualityGateStatus.PASSED;

      if (!isGptPassed) {
        throw new BadRequestException(
          'Quality Gate Blocker: Cannot start cutting. Garment Performance Test (GPT) must be PASSED first (wash appearance, seam slippage, torque).',
        );
      }
    }

    // ----------------- QUALITY GATE 3: SIZE SET APPROVAL CHECK -----------------
    // If sizeSetRequired is true, cutting cannot commence without Size Set Sample Approval
    if (order.sizeSetRequired && targetIndex >= cuttingIndex) {
      const latestSizeSet = order.sizeSetApprovals[0];
      const isSizeSetPassed =
        order.sizeSetStatus === QualityGateStatus.PASSED || latestSizeSet?.status === QualityGateStatus.PASSED;

      if (!isSizeSetPassed) {
        throw new BadRequestException(
          'Quality Gate Blocker: Buyer Size Set Sample Approval is REQUIRED before cutting fabric. Submit and approve size set sample or obtain written waiver.',
        );
      }
    }

    // Execute atomic stage transition and history recording
    const terminalNode = user.assignedNode || WorkstationNode.NODE_10_ADMIN_MD;

    const [updatedOrder] = await this.prisma.$transaction([
      this.prisma.order.update({
        where: { id: orderId },
        data: {
          currentStage: nextStage,
          cloudVersion: { increment: 1 },
          syncStatus: 'PENDING',
        },
      }),
      this.prisma.workflowStageHistory.create({
        data: {
          orderId: order.id,
          fromStage: order.currentStage,
          toStage: nextStage,
          transitionedBy: `${user.fullName} (${user.roleType})`,
          terminalNode,
          comments: comments || `Advanced workflow to ${nextStage}`,
        },
      }),
    ]);

    // Audit log state transition
    await this.auditService.log({
      userId: user.id,
      node: terminalNode,
      module: 'WORKFLOW',
      action: 'STAGE_TRANSITION',
      entityType: 'Order',
      entityId: order.id,
      details: {
        fromStage: order.currentStage,
        toStage: nextStage,
        comments,
      },
    });

    return updatedOrder;
  }
}
