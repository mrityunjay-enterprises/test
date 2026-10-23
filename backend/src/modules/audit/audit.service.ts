import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export interface CreateAuditLogDto {
  userId?: string;
  node?: any;
  module: string;
  action: string;
  entityType: string;
  entityId: string;
  details?: Record<string, any>;
  ipAddress?: string;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private prisma: PrismaService) {}

  async log(dto: CreateAuditLogDto) {
    this.logger.log(`[AUDIT] Action: ${dto.action} on ${dto.entityType}:${dto.entityId} by user: ${dto.userId || 'SYSTEM'}`);
    try {
      return await this.prisma.auditLog.create({
        data: {
          userId: dto.userId,
          node: dto.node,
          module: dto.module,
          action: dto.action,
          entityType: dto.entityType,
          entityId: dto.entityId,
          details: dto.details ? JSON.parse(JSON.stringify(dto.details)) : undefined,
          ipAddress: dto.ipAddress,
        },
      });
    } catch (err) {
      this.logger.error(`Failed to persist audit log: ${err.message}`, err.stack);
    }
  }

  async findRecent(limit = 50) {
    return this.prisma.auditLog.findMany({
      take: limit,
      orderBy: { timestamp: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            roleType: true,
          },
        },
      },
    });
  }
}
