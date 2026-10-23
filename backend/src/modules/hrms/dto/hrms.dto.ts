import { IsNotEmpty, IsString, IsEnum, IsOptional, IsNumber, IsDateString, Min } from 'class-validator';
import { WageModel } from '@prisma/client';

export class CreateEmployeeDto {
  @IsNotEmpty()
  @IsString()
  employeeCode: string;

  @IsNotEmpty()
  @IsString()
  fullName: string;

  @IsNotEmpty()
  @IsString()
  departmentId: string;

  @IsNotEmpty()
  @IsString()
  designation: string;

  @IsEnum(WageModel)
  wageModel: WageModel;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  baseSalaryMonthly?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  baseHourlyRate?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  defaultPieceRate?: number;

  @IsNotEmpty()
  @IsString()
  bankName: string;

  @IsNotEmpty()
  @IsString()
  bankAccountNo: string;

  @IsNotEmpty()
  @IsString()
  ifscCode: string;

  @IsOptional()
  @IsString()
  panNumber?: string;

  @IsOptional()
  @IsString()
  uanNumber?: string;
}

export class LogAttendanceDto {
  @IsNotEmpty()
  @IsString()
  employeeId: string;

  @IsDateString()
  workDate: string;

  @IsOptional()
  @IsDateString()
  inTime?: string;

  @IsOptional()
  @IsDateString()
  outTime?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  totalHours: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  overtimeHours: number;

  @IsNotEmpty()
  @IsString()
  status: string; // "PRESENT" | "ABSENT" | "HALF_DAY" | "PAID_LEAVE"

  @IsNotEmpty()
  @IsString()
  source: string; // "BIOMETRIC_PUNCH" | "MANUAL_SUPERVISOR"
}
