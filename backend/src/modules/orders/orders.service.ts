import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { WorkflowService } from '../workflow/workflow.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { AdvanceWorkflowDto } from './dto/advance-workflow.dto';
import { Prisma, WorkflowStage, WorkstationNode } from '@prisma/client';
import { AuditService } from '../audit/audit.service';

const FLOOR_TERMINAL_NODES: string[] = [
  'NODE_03_STORE',
  'NODE_04_CUTTING',
  'NODE_05_SEWING',
  'NODE_06_FINISHING',
  'NODE_07_PACKING_DISPATCH',
];

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private workflowService: WorkflowService,
    private auditService: AuditService,
  ) {}

  async create(createOrderDto: CreateOrderDto, user: { id: string; fullName: string; roleType: string; assignedNode?: WorkstationNode }) {
    const existing = await this.prisma.order.findUnique({
      where: { orderNumber: createOrderDto.orderNumber },
    });

    if (existing) {
      throw new BadRequestException(`Order with number ${createOrderDto.orderNumber} already exists`);
    }

    // Precise monetary calculation
    const unitPriceDecimal = new Prisma.Decimal(createOrderDto.unitPrice);
    const totalOrderValueDecimal = unitPriceDecimal.mul(createOrderDto.totalQuantity);

    const order = await this.prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          orderNumber: createOrderDto.orderNumber,
          buyerPoNumber: createOrderDto.buyerPoNumber,
          customerId: createOrderDto.customerId,
          styleId: createOrderDto.styleId,
          totalQuantity: createOrderDto.totalQuantity,
          unitPrice: unitPriceDecimal,
          totalOrderValue: totalOrderValueDecimal,
          targetDeliveryDate: new Date(createOrderDto.targetDeliveryDate),
          currentStage: WorkflowStage.ORDER_CONFIRMED,
          sizeSetRequired: createOrderDto.sizeSetRequired,
          createdById: user.id,
          sizeBreakups: {
            create: createOrderDto.sizeBreakups.map((sb) => ({
              colorName: sb.colorName,
              sizeName: sb.sizeName,
              quantity: sb.quantity,
            })),
          },
        },
        include: {
          sizeBreakups: true,
          customer: { select: { id: true, companyName: true, code: true } },
          style: { select: { id: true, styleNumber: true, styleName: true } },
        },
      });

      // Log initial milestone
      await tx.workflowStageHistory.create({
        data: {
          orderId: createdOrder.id,
          fromStage: WorkflowStage.ORDER_CONFIRMED,
          toStage: WorkflowStage.ORDER_CONFIRMED,
          transitionedBy: `${user.fullName} (${user.roleType})`,
          terminalNode: user.assignedNode || WorkstationNode.NODE_01_MERCHANDISING,
          comments: 'Order created and confirmed by Merchandising',
        },
      });

      return createdOrder;
    });

    await this.auditService.log({
      userId: user.id,
      node: user.assignedNode,
      module: 'ORDERS',
      action: 'CREATE_ORDER',
      entityType: 'Order',
      entityId: order.id,
      details: {
        orderNumber: order.orderNumber,
        totalQuantity: order.totalQuantity,
        totalValue: totalOrderValueDecimal.toString(),
      },
    });

    return order;
  }

  async findAll(user: { assignedNode?: string; isSuperAdmin?: boolean }) {
    const orders = await this.prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { id: true, companyName: true, code: true } },
        style: { select: { id: true, styleNumber: true, styleName: true } },
        sizeBreakups: true,
      },
    });

    const isFloorNode = !user.isSuperAdmin && user.assignedNode && FLOOR_TERMINAL_NODES.includes(user.assignedNode);

    // COMMERCIAL PRIVACY: Strip pricing from shop floor screens
    if (isFloorNode) {
      return orders.map((o) => {
        const { unitPrice, totalOrderValue, ...floorData } = o;
        return {
          ...floorData,
          unitPrice: null,
          totalOrderValue: null,
          isFinancialDataMasked: true,
        };
      });
    }

    return orders;
  }

  async findOne(id: string, user: { assignedNode?: string; isSuperAdmin?: boolean }) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        style: { include: { bomItems: true } },
        sizeBreakups: true,
        stageHistory: { orderBy: { timestamp: 'desc' }, take: 20 },
        fptRecords: { orderBy: { testedAt: 'desc' }, take: 1 },
        gptRecords: { orderBy: { testedAt: 'desc' }, take: 1 },
        sizeSetApprovals: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    const isFloorNode = !user.isSuperAdmin && user.assignedNode && FLOOR_TERMINAL_NODES.includes(user.assignedNode);

    if (isFloorNode) {
      const { unitPrice, totalOrderValue, ...floorData } = order;
      return {
        ...floorData,
        unitPrice: null,
        totalOrderValue: null,
        isFinancialDataMasked: true,
      };
    }

    return order;
  }

  async advanceWorkflow(
    orderId: string,
    dto: AdvanceWorkflowDto,
    user: { id: string; fullName: string; roleType: string; assignedNode?: WorkstationNode },
  ) {
    return this.workflowService.advanceOrderWorkflow(orderId, dto.nextStage, user, dto.comments);
  }

  async getCustomers() {
    return this.prisma.customer.findMany({
      orderBy: { companyName: 'asc' },
    });
  }

  async createCustomer(
    data: {
      code: string;
      companyName: string;
      contactPerson: string;
      email: string;
      phone: string;
      gstNumber?: string;
      billingAddress?: string;
      shippingAddress?: string;
      creditLimit?: number;
    },
    user: any,
  ) {
    const existing = await this.prisma.customer.findUnique({
      where: { code: data.code },
    });
    if (existing) {
      throw new BadRequestException(`Customer with code ${data.code} already exists`);
    }

    const customer = await this.prisma.customer.create({
      data: {
        code: data.code,
        companyName: data.companyName,
        contactPerson: data.contactPerson,
        email: data.email,
        phone: data.phone,
        gstNumber: data.gstNumber,
        billingAddress: data.billingAddress || `${data.companyName} Registered Office`,
        shippingAddress:
          data.shippingAddress || data.billingAddress || `${data.companyName} Delivery Warehouse`,
        creditLimit: data.creditLimit ? new Prisma.Decimal(data.creditLimit) : new Prisma.Decimal(500000),
      },
    });

    if (user?.id) {
      await this.auditService.log({
        userId: user.id,
        module: 'CUSTOMERS',
        action: 'CREATE_CUSTOMER',
        entityType: 'Customer',
        entityId: customer.id,
        details: { code: customer.code, companyName: customer.companyName },
      });
    }

    return customer;
  }
}
