import { IsNotEmpty, IsString, IsNumber, IsEnum, IsOptional } from 'class-validator';
import { QualityGateStatus } from '@prisma/client';

export class CreateFptRecordDto {
  @IsNotEmpty()
  @IsString()
  orderId: string;

  @IsNotEmpty()
  @IsString()
  fabricLotNo: string;

  @IsNumber()
  shrinkageWarp: number;

  @IsNumber()
  shrinkageWeft: number;

  @IsNumber()
  rubbingDry: number;

  @IsNumber()
  rubbingWet: number;

  @IsNumber()
  washingFastness: number;

  @IsNumber()
  actualGsm: number;

  @IsEnum(QualityGateStatus)
  status: QualityGateStatus;

  @IsOptional()
  @IsString()
  remarks?: string;
}

export class CreateGptRecordDto {
  @IsNotEmpty()
  @IsString()
  orderId: string;

  @IsNotEmpty()
  @IsString()
  washAppearance: string;

  @IsNumber()
  seamStrengthKg: number;

  @IsNumber()
  torquePercent: number;

  @IsEnum(QualityGateStatus)
  status: QualityGateStatus;

  @IsOptional()
  @IsString()
  remarks?: string;
}

export class CreateSizeSetApprovalDto {
  @IsNotEmpty()
  @IsString()
  orderId: string;

  @IsNotEmpty()
  @IsString()
  sampleSize: string;

  @IsEnum(QualityGateStatus)
  status: QualityGateStatus;

  @IsOptional()
  @IsString()
  buyerComments?: string;
}
