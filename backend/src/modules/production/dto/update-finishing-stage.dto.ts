import { IsNotEmpty, IsString, IsInt, IsOptional, Min } from 'class-validator';

export class UpdateFinishingStageDto {
  @IsNotEmpty()
  @IsString()
  orderId: string;

  @IsNotEmpty()
  @IsString()
  stage:
    | 'STAGE_1_BARTACK_EYELET_BUTTON'
    | 'STAGE_2_THREAD_TRIMMING'
    | 'STAGE_3_PRESS_1'
    | 'STAGE_4_INITIAL_QC_CHECK'
    | 'STAGE_5_FINAL_PRESS'
    | 'STAGE_6_FINAL_QA_AUDIT';

  @IsInt()
  @Min(0)
  passedQty: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  failedQty?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  repairedQty?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  damagedQty?: number;
}
