import { IsNotEmpty, IsEnum, IsOptional, IsString } from 'class-validator';
import { WorkflowStage } from '@prisma/client';

export class AdvanceWorkflowDto {
  @IsNotEmpty()
  @IsEnum(WorkflowStage)
  nextStage: WorkflowStage;

  @IsOptional()
  @IsString()
  comments?: string;
}
