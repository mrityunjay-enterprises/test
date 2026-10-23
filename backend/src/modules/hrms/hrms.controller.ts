import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { HrmsService } from './hrms.service';
import { CreateEmployeeDto, LogAttendanceDto } from './dto/hrms.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TerminalNodeGuard, AllowedNodes } from '../../common/guards/terminal-node.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard, TerminalNodeGuard)
@Controller('hrms')
export class HrmsController {
  constructor(private hrmsService: HrmsService) {}

  @Roles('ACCOUNTS_HR_EXECUTIVE', 'MANAGING_DIRECTOR', 'DIRECTOR_PARTNER', 'GENERAL_MANAGER')
  @AllowedNodes('NODE_08_ACCOUNTS_HR_1', 'NODE_09_ACCOUNTS_HR_2', 'NODE_10_ADMIN_MD', 'NODE_11_ADMIN_PARTNER', 'NODE_12_ADMIN_GM')
  @Post('employees')
  createEmployee(@Body() dto: CreateEmployeeDto) {
    return this.hrmsService.createEmployee(dto);
  }

  @Get('employees')
  findAllEmployees() {
    return this.hrmsService.findAllEmployees();
  }

  @Get('employees/:id')
  findEmployeeById(@Param('id') id: string) {
    return this.hrmsService.findEmployeeById(id);
  }

  @Roles('ACCOUNTS_HR_EXECUTIVE', 'SEWING_SUPERVISOR', 'MANAGING_DIRECTOR', 'DIRECTOR_PARTNER', 'GENERAL_MANAGER')
  @Post('attendance')
  logAttendance(@Body() dto: LogAttendanceDto) {
    return this.hrmsService.logAttendance(dto);
  }
}
