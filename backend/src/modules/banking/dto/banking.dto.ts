import { IsNotEmpty, IsOptional, IsString, IsBoolean } from 'class-validator';

export class CreatePayoutBatchDto {
  @IsString()
  @IsNotEmpty()
  periodId: string;

  @IsString()
  @IsOptional()
  bankProvider?: string;
}

export class ApprovePayoutBatchDto {
  @IsString()
  @IsOptional()
  comments?: string;
}

export class SubmitPayoutBatchDto {
  @IsBoolean()
  @IsOptional()
  retryFailedOnly?: boolean;
}
