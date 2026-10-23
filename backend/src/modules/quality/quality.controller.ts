import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { QualityService } from './quality.service';
import { CreateFptRecordDto, CreateGptRecordDto, CreateSizeSetApprovalDto } from './dto/quality-records.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('quality')
export class QualityController {
  constructor(private qualityService: QualityService) {}

  @Roles('QUALITY_MANAGER', 'MANAGING_DIRECTOR', 'DIRECTOR_PARTNER', 'GENERAL_MANAGER')
  @Post('fpt')
  recordFpt(@Body() dto: CreateFptRecordDto, @CurrentUser() user: any) {
    return this.qualityService.recordFpt(dto, user);
  }

  @Roles('QUALITY_MANAGER', 'MANAGING_DIRECTOR', 'DIRECTOR_PARTNER', 'GENERAL_MANAGER')
  @Post('gpt')
  recordGpt(@Body() dto: CreateGptRecordDto, @CurrentUser() user: any) {
    return this.qualityService.recordGpt(dto, user);
  }

  @Roles('MERCHANDISER', 'QUALITY_MANAGER', 'MANAGING_DIRECTOR', 'DIRECTOR_PARTNER', 'GENERAL_MANAGER')
  @Post('size-set')
  recordSizeSetApproval(@Body() dto: CreateSizeSetApprovalDto, @CurrentUser() user: any) {
    return this.qualityService.recordSizeSetApproval(dto, user);
  }

  @Get('orders/:orderId')
  getOrderQuality(@Param('orderId') orderId: string) {
    return this.qualityService.getOrderQualityHistory(orderId);
  }
}
