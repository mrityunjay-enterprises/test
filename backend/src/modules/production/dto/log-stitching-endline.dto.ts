import { IsNotEmpty, IsString, IsInt, Min } from 'class-validator';

export class LogStitchingEndlineDto {
  @IsNotEmpty()
  @IsString()
  orderId: string;

  @IsNotEmpty()
  @IsString()
  productionLineId: string;

  @IsInt()
  @Min(1)
  inspectedPieces: number;

  @IsInt()
  @Min(0)
  goodPassed: number;

  @IsInt()
  @Min(0)
  underAlteration: number;

  @IsInt()
  @Min(0)
  repairedPieces: number;

  @IsInt()
  @Min(0)
  damagedScrap: number;

  @IsNotEmpty()
  @IsString()
  shiftName: string;
}
