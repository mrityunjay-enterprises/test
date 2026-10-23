import { IsNotEmpty, IsString, IsInt, IsNumber, IsDateString, Min } from 'class-validator';

export class CreatePieceWorkTicketDto {
  @IsNotEmpty()
  @IsString()
  orderId: string;

  @IsNotEmpty()
  @IsString()
  employeeId: string;

  @IsNotEmpty()
  @IsString()
  operationName: string;

  @IsInt()
  @Min(1)
  piecesSubmitted: number;

  @IsInt()
  @Min(0)
  qcPassedPieces: number;

  @IsInt()
  @Min(0)
  defectivePieces: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  ratePerPiece: number;

  @IsDateString()
  workDate: string;
}

export class CreateHourlyLogDto {
  @IsNotEmpty()
  @IsString()
  employeeId: string;

  @IsDateString()
  workDate: string;

  @IsNotEmpty()
  @IsString()
  lineAllocated: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  regularHours: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  overtimeHours: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  hourlyRate: number;
}
