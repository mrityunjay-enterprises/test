import { Controller, Post, Patch, Get, Body, Param, UseGuards } from '@nestjs/common';
import { ProductionService } from './production.service';
import { CreateCutReportDto } from './dto/create-cut-report.dto';
import { LogStitchingEndlineDto } from './dto/log-stitching-endline.dto';
import { UpdateFinishingStageDto } from './dto/update-finishing-stage.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TerminalNodeGuard, AllowedNodes } from '../../common/guards/terminal-node.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard, RolesGuard, TerminalNodeGuard)
@Controller('production')
export class ProductionController {
  constructor(private productionService: ProductionService) {}

  @Roles('CUTTING_MASTER', 'MANAGING_DIRECTOR', 'DIRECTOR_PARTNER', 'GENERAL_MANAGER')
  @AllowedNodes('NODE_04_CUTTING', 'NODE_10_ADMIN_MD', 'NODE_11_ADMIN_PARTNER', 'NODE_12_ADMIN_GM')
  @Post('cut-report')
  generateCutOrderReport(@Body() dto: CreateCutReportDto, @CurrentUser() user: any) {
    return this.productionService.generateCutOrderReport(dto, user);
  }

  @Roles('SEWING_SUPERVISOR', 'MANAGING_DIRECTOR', 'DIRECTOR_PARTNER', 'GENERAL_MANAGER')
  @AllowedNodes('NODE_05_SEWING', 'NODE_10_ADMIN_MD', 'NODE_11_ADMIN_PARTNER', 'NODE_12_ADMIN_GM')
  @Post('stitching-endline')
  logStitchingEndline(@Body() dto: LogStitchingEndlineDto, @CurrentUser() user: any) {
    return this.productionService.logStitchingEndline(dto, user);
  }

  @Roles('FINISHING_INCHARGE', 'MANAGING_DIRECTOR', 'DIRECTOR_PARTNER', 'GENERAL_MANAGER')
  @AllowedNodes('NODE_06_FINISHING', 'NODE_10_ADMIN_MD', 'NODE_11_ADMIN_PARTNER', 'NODE_12_ADMIN_GM')
  @Patch('finishing-stage')
  updateFinishingStage(@Body() dto: UpdateFinishingStageDto, @CurrentUser() user: any) {
    return this.productionService.updateFinishingStage(dto, user);
  }

  @Get('orders/:orderId')
  getOrderProductionSummary(@Param('orderId') orderId: string) {
    return this.productionService.getOrderProductionSummary(orderId);
  }
}
