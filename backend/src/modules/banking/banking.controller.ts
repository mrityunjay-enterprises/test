import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { BankingService } from './banking.service';
import {
  CreatePayoutBatchDto,
  ApprovePayoutBatchDto,
} from './dto/banking.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TerminalNodeGuard, AllowedNodes } from '../../common/guards/terminal-node.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard, TerminalNodeGuard)
@Controller('banking')
export class BankingController {
  constructor(private readonly bankingService: BankingService) {}

  @Roles(
    'ACCOUNTS_HR_EXECUTIVE',
    'MANAGING_DIRECTOR',
    'DIRECTOR_PARTNER',
    'GENERAL_MANAGER',
  )
  @AllowedNodes(
    'NODE_08_ACCOUNTS_HR_1',
    'NODE_09_ACCOUNTS_HR_2',
    'NODE_10_ADMIN_MD',
    'NODE_11_ADMIN_PARTNER',
    'NODE_12_ADMIN_GM',
  )
  @Post('batches')
  createPayoutBatch(@Body() dto: CreatePayoutBatchDto, @Request() req: any) {
    return this.bankingService.createPayoutBatch(
      dto,
      req.user.userId,
      req.user.fullName || req.user.username,
    );
  }

  @Roles('MANAGING_DIRECTOR', 'DIRECTOR_PARTNER', 'GENERAL_MANAGER')
  @AllowedNodes('NODE_10_ADMIN_MD', 'NODE_11_ADMIN_PARTNER', 'NODE_12_ADMIN_GM')
  @Post('batches/:id/approve')
  approvePayoutBatch(
    @Param('id') id: string,
    @Body() dto: ApprovePayoutBatchDto,
    @Request() req: any,
  ) {
    return this.bankingService.approvePayoutBatch(id, dto, {
      id: req.user.userId,
      fullName: req.user.fullName || req.user.username,
      isSuperAdmin: req.user.isSuperAdmin,
      roleType: req.user.roleType,
    });
  }

  @Roles(
    'ACCOUNTS_HR_EXECUTIVE',
    'MANAGING_DIRECTOR',
    'DIRECTOR_PARTNER',
    'GENERAL_MANAGER',
  )
  @AllowedNodes(
    'NODE_08_ACCOUNTS_HR_1',
    'NODE_09_ACCOUNTS_HR_2',
    'NODE_10_ADMIN_MD',
    'NODE_11_ADMIN_PARTNER',
    'NODE_12_ADMIN_GM',
  )
  @Post('batches/:id/submit')
  submitPayoutBatch(@Param('id') id: string) {
    return this.bankingService.submitPayoutBatch(id);
  }

  @Roles(
    'ACCOUNTS_HR_EXECUTIVE',
    'MANAGING_DIRECTOR',
    'DIRECTOR_PARTNER',
    'GENERAL_MANAGER',
  )
  @AllowedNodes(
    'NODE_08_ACCOUNTS_HR_1',
    'NODE_09_ACCOUNTS_HR_2',
    'NODE_10_ADMIN_MD',
    'NODE_11_ADMIN_PARTNER',
    'NODE_12_ADMIN_GM',
  )
  @Post('batches/:id/reconcile')
  reconcilePayoutBatch(@Param('id') id: string) {
    return this.bankingService.reconcilePayoutBatch(id);
  }

  @Roles(
    'ACCOUNTS_HR_EXECUTIVE',
    'MANAGING_DIRECTOR',
    'DIRECTOR_PARTNER',
    'GENERAL_MANAGER',
  )
  @AllowedNodes(
    'NODE_08_ACCOUNTS_HR_1',
    'NODE_09_ACCOUNTS_HR_2',
    'NODE_10_ADMIN_MD',
    'NODE_11_ADMIN_PARTNER',
    'NODE_12_ADMIN_GM',
  )
  @Get('batches')
  getPayoutBatches() {
    return this.bankingService.getPayoutBatches();
  }

  @Roles(
    'ACCOUNTS_HR_EXECUTIVE',
    'MANAGING_DIRECTOR',
    'DIRECTOR_PARTNER',
    'GENERAL_MANAGER',
  )
  @AllowedNodes(
    'NODE_08_ACCOUNTS_HR_1',
    'NODE_09_ACCOUNTS_HR_2',
    'NODE_10_ADMIN_MD',
    'NODE_11_ADMIN_PARTNER',
    'NODE_12_ADMIN_GM',
  )
  @Get('batches/:id')
  getPayoutBatchById(@Param('id') id: string) {
    return this.bankingService.getPayoutBatchById(id);
  }
}
