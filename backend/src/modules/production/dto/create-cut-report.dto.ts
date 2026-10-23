import { IsNotEmpty, IsString, IsInt, IsNumber, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class BundleItemDto {
  @IsNotEmpty()
  @IsString()
  bundleNumber: string;

  @IsNotEmpty()
  @IsString()
  sizeName: string;

  @IsNotEmpty()
  @IsString()
  colorName: string;

  @IsInt()
  @Min(1)
  piecesCount: number;
}

export class CreateCutReportDto {
  @IsNotEmpty()
  @IsString()
  orderId: string;

  @IsNotEmpty()
  @IsString()
  reportNumber: string;

  @IsInt()
  @Min(1)
  pliesCut: number;

  @IsInt()
  @Min(1)
  totalPiecesCut: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  actualFabMeters: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  targetConsumptionPerPc: number;

  @IsInt()
  bundleStartNo: number;

  @IsInt()
  bundleEndNo: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BundleItemDto)
  bundles: BundleItemDto[];
}
