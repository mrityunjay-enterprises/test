import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { LaborService } from './labor.service';
import { CreatePieceWorkTicketDto, CreateHourlyLogDto } from './dto/labor-records.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TerminalNodeGuard, AllowedNodes } from '../../common/guards/terminal-node.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard, RolesGuard, TerminalNodeGuard)
@Controller('labor')
export class LaborController {
  constructor(private laborService: LaborService) {}

  @Roles('SEWING_SUPERVISOR', 'FINISHING_INCHARGE', 'MANAGING_DIRECTOR', 'DIRECTOR_PARTNER', 'GENERAL_MANAGER')
  @AllowedNodes('NODE_05_SEWING', 'NODE_06_FINISHING', 'NODE_10_ADMIN_MD', 'NODE_11_ADMIN_PARTNER', 'NODE_12_ADMIN_GM')
  @Post('piece-work')
  createPieceWorkTicket(@Body() dto: CreatePieceWorkTicketDto, @CurrentUser() user: any) {
    return this.laborService.createPieceWorkTicket(dto, user);
  }

  @Roles('SEWING_SUPERVISOR', 'FINISHING_INCHARGE', 'MANAGING_DIRECTOR', 'DIRECTOR_PARTNER', 'GENERAL_MANAGER')
  @AllowedNodes('NODE_05_SEWING', 'NODE_06_FINISHING', 'NODE_10_ADMIN_MD', 'NODE_11_ADMIN_PARTNER', 'NODE_12_ADMIN_GM')
  @Post('hourly-log')
  createHourlyLog(@Body() dto: CreateHourlyLogDto) {
    return this.laborService.createHourlyLog(dto);
  }

  @Get('orders/:orderId/cost-summary')
  getOrderLaborCostSummary(@Param('orderId') orderId: string) {
    return this.laborService.getOrderLaborCostSummary(orderId);
  }
}
