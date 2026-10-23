import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateEmployeeDto, LogAttendanceDto } from './dto/hrms.dto';
import { Prisma, WageModel } from '@prisma/client';

@Injectable()
export class HrmsService {
  constructor(private prisma: PrismaService) {}

  async createEmployee(dto: CreateEmployeeDto) {
    const existing = await this.prisma.employee.findUnique({
      where: { employeeCode: dto.employeeCode },
    });
    if (existing) {
      throw new BadRequestException(`Employee with code ${dto.employeeCode} already exists`);
    }

    // Validate wage configuration: never accept incomplete salary setups!
    if (dto.wageModel === WageModel.MONTHLY_SALARIED && !dto.baseSalaryMonthly) {
      throw new BadRequestException('Monthly Salaried employees require baseSalaryMonthly');
    }
    if (dto.wageModel === WageModel.HOURLY_WAGE && !dto.baseHourlyRate) {
      throw new BadRequestException('Hourly Wage employees require baseHourlyRate');
    }
    if (dto.wageModel === WageModel.PIECE_RATE && !dto.defaultPieceRate) {
      throw new BadRequestException('Piece-Rate employees require defaultPieceRate');
    }

    return this.prisma.employee.create({
      data: {
        employeeCode: dto.employeeCode,
        fullName: dto.fullName,
        departmentId: dto.departmentId,
        designation: dto.designation,
        wageModel: dto.wageModel,
        baseSalaryMonthly: dto.baseSalaryMonthly ? new Prisma.Decimal(dto.baseSalaryMonthly) : null,
        baseHourlyRate: dto.baseHourlyRate ? new Prisma.Decimal(dto.baseHourlyRate) : null,
        defaultPieceRate: dto.defaultPieceRate ? new Prisma.Decimal(dto.defaultPieceRate) : null,
        bankName: dto.bankName,
        bankAccountNo: dto.bankAccountNo,
        ifscCode: dto.ifscCode,
        panNumber: dto.panNumber,
        uanNumber: dto.uanNumber,
      },
    });
  }

  async logAttendance(dto: LogAttendanceDto) {
    const employee = await this.prisma.employee.findUnique({ where: { id: dto.employeeId } });
    if (!employee) throw new NotFoundException(`Employee ${dto.employeeId} not found`);

    const dateOnly = new Date(dto.workDate);

    return this.prisma.attendanceDaily.upsert({
      where: {
        employeeId_workDate: {
          employeeId: dto.employeeId,
          workDate: dateOnly,
        },
      },
      create: {
        employeeId: dto.employeeId,
        workDate: dateOnly,
        inTime: dto.inTime ? new Date(dto.inTime) : null,
        outTime: dto.outTime ? new Date(dto.outTime) : null,
        totalHours: new Prisma.Decimal(dto.totalHours),
        overtimeHours: new Prisma.Decimal(dto.overtimeHours),
        status: dto.status,
        source: dto.source,
      },
      update: {
        inTime: dto.inTime ? new Date(dto.inTime) : undefined,
        outTime: dto.outTime ? new Date(dto.outTime) : undefined,
        totalHours: new Prisma.Decimal(dto.totalHours),
        overtimeHours: new Prisma.Decimal(dto.overtimeHours),
        status: dto.status,
      },
    });
  }

  async findAllEmployees() {
    return this.prisma.employee.findMany({
      orderBy: { employeeCode: 'asc' },
      include: { department: { select: { name: true, code: true } } },
    });
  }

  async findEmployeeById(id: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
      include: { department: true },
    });
    if (!employee) throw new NotFoundException(`Employee ${id} not found`);
    return employee;
  }
}
