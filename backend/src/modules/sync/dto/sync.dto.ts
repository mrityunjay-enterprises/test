import { IsNotEmpty, IsOptional, IsString, IsArray, IsEnum, IsNumber } from 'class-validator';
import { SyncOperation, WorkstationNode } from '@prisma/client';

export class SyncEventDto {
  @IsString()
  @IsNotEmpty()
  entityName: string;

  @IsString()
  @IsNotEmpty()
  entityId: string;

  @IsEnum(SyncOperation)
  operation: SyncOperation;

  @IsNotEmpty()
  payload: any;

  @IsNumber()
  version: number;

  @IsEnum(WorkstationNode)
  originNode: WorkstationNode;
}

export class PullSyncQueryDto {
  @IsString()
  @IsNotEmpty()
  clientNodeId: string;

  @IsOptional()
  lastSyncedId?: string;

  @IsOptional()
  limit?: number;
}

export class AcknowledgeSyncDto {
  @IsString()
  @IsNotEmpty()
  clientNodeId: string;

  @IsNotEmpty()
  lastSyncedOutboxId: string;
}

export class IncomingSyncBatchDto {
  @IsString()
  @IsNotEmpty()
  clientNodeId: string;

  @IsArray()
  events: SyncEventDto[];
}

export class ResolveConflictDto {
  @IsString()
  @IsNotEmpty()
  resolution: 'APPLY_CLOUD' | 'APPLY_LOCAL' | 'MANUAL_MERGE';

  @IsOptional()
  mergedPayload?: any;
}
