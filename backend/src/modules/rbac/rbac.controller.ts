import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { RbacService } from './rbac.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('rbac')
export class RbacController {
  constructor(private rbacService: RbacService) {}

  @Get('nodes')
  getAllNodes() {
    return this.rbacService.getAllNodes();
  }

  @UseGuards(JwtAuthGuard)
  @Get('nodes/:nodeCode')
  getNode(@Param('nodeCode') nodeCode: string) {
    return this.rbacService.getNode(nodeCode);
  }
}
