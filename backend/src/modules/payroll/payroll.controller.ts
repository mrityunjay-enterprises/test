import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { PayrollService } from './payroll.service';
import { CreatePayrollPeriodDto } from './dto/payroll.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TerminalNodeGuard, AllowedNodes } from '../../common/guards/terminal-node.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard, RolesGuard, TerminalNodeGuard)
@Controller('payroll')
export class PayrollController {
  constructor(private payrollService: PayrollService) {}

  @Roles('ACCOUNTS_HR_EXECUTIVE', 'MANAGING_DIRECTOR', 'DIRECTOR_PARTNER', 'GENERAL_MANAGER')
  @AllowedNodes('NODE_08_ACCOUNTS_HR_1', 'NODE_09_ACCOUNTS_HR_2', 'NODE_10_ADMIN_MD', 'NODE_11_ADMIN_PARTNER', 'NODE_12_ADMIN_GM')
  @Post('periods')
  createPeriod(@Body() dto: CreatePayrollPeriodDto) {
    return this.payrollService.createPeriod(dto);
  }

  @Roles('ACCOUNTS_HR_EXECUTIVE', 'MANAGING_DIRECTOR', 'DIRECTOR_PARTNER', 'GENERAL_MANAGER')
  @AllowedNodes('NODE_08_ACCOUNTS_HR_1', 'NODE_09_ACCOUNTS_HR_2', 'NODE_10_ADMIN_MD', 'NODE_11_ADMIN_PARTNER', 'NODE_12_ADMIN_GM')
  @Post('periods/:id/calculate')
  calculatePeriodPayroll(@Param('id') id: string, @CurrentUser() user: any) {
    return this.payrollService.calculatePeriodPayroll(id, user);
  }

  @Roles('MANAGING_DIRECTOR', 'DIRECTOR_PARTNER', 'GENERAL_MANAGER')
  @AllowedNodes('NODE_10_ADMIN_MD', 'NODE_11_ADMIN_PARTNER', 'NODE_12_ADMIN_GM')
  @Post('periods/:id/lock')
  lockPayrollPeriod(@Param('id') id: string, @CurrentUser() user: any) {
    return this.payrollService.lockPayrollPeriod(id, user);
  }

  @Roles('ACCOUNTS_HR_EXECUTIVE', 'MANAGING_DIRECTOR', 'DIRECTOR_PARTNER', 'GENERAL_MANAGER')
  @AllowedNodes('NODE_08_ACCOUNTS_HR_1', 'NODE_09_ACCOUNTS_HR_2', 'NODE_10_ADMIN_MD', 'NODE_11_ADMIN_PARTNER', 'NODE_12_ADMIN_GM')
  @Get('periods/:id')
  findPeriodSummary(@Param('id') id: string) {
    return this.payrollService.findPeriodSummary(id);
  }

  @Get('slips/:id')
  getItemizedPayslip(@Param('id') id: string) {
    return this.payrollService.getItemizedPayslip(id);
  }
}
