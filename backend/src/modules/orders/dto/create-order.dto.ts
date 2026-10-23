import { IsNotEmpty, IsString, IsInt, IsNumber, IsBoolean, IsArray, ValidateNested, IsDateString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class OrderSizeBreakupDto {
  @IsNotEmpty()
  @IsString()
  colorName: string;

  @IsNotEmpty()
  @IsString()
  sizeName: string;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @IsNotEmpty()
  @IsString()
  orderNumber: string;

  @IsNotEmpty()
  @IsString()
  buyerPoNumber: string;

  @IsNotEmpty()
  @IsString()
  customerId: string;

  @IsNotEmpty()
  @IsString()
  styleId: string;

  @IsInt()
  @Min(1)
  totalQuantity: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  unitPrice: number;

  @IsDateString()
  targetDeliveryDate: string;

  @IsBoolean()
  sizeSetRequired: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderSizeBreakupDto)
  sizeBreakups: OrderSizeBreakupDto[];
}
