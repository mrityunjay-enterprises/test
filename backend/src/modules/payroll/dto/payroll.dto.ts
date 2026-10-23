import { IsNotEmpty, IsString, IsDateString } from 'class-validator';

export class CreatePayrollPeriodDto {
  @IsNotEmpty()
  @IsString()
  periodCode: string; // e.g. "2026-10"

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;
}
