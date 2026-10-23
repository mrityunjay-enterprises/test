import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { SyncService } from './sync.service';
import {
  AcknowledgeSyncDto,
  IncomingSyncBatchDto,
  ResolveConflictDto,
} from './dto/sync.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('sync')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Get('outbox/pending')
  getPendingEvents(
    @Query('clientNodeId') clientNodeId: string,
    @Query('limit') limit?: number,
  ) {
    return this.syncService.getPendingOutboxEvents(
      clientNodeId,
      limit ? Number(limit) : 100,
    );
  }

  @Post('outbox/acknowledge')
  acknowledgeSync(@Body() dto: AcknowledgeSyncDto) {
    return this.syncService.acknowledgeSync(dto);
  }

  @Post('inbox/apply')
  applyIncomingSync(@Body() batch: IncomingSyncBatchDto) {
    return this.syncService.applyIncomingSync(batch);
  }

  @Get('conflicts')
  getConflictLogs() {
    return this.syncService.getConflictLogs();
  }

  @Roles('MANAGING_DIRECTOR', 'DIRECTOR_PARTNER', 'GENERAL_MANAGER')
  @Post('conflicts/:id/resolve')
  resolveConflict(
    @Param('id') id: string,
    @Body() dto: ResolveConflictDto,
    @Request() req: any,
  ) {
    return this.syncService.resolveConflict(
      id,
      dto,
      req.user.fullName || req.user.username,
    );
  }
}
