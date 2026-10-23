import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { AdvanceWorkflowDto } from './dto/advance-workflow.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Roles('MERCHANDISER', 'MANAGING_DIRECTOR', 'DIRECTOR_PARTNER', 'GENERAL_MANAGER')
  @Post()
  create(@Body() createOrderDto: CreateOrderDto, @CurrentUser() user: any) {
    return this.ordersService.create(createOrderDto, user);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.ordersService.findAll(user);
  }

  @Get('customers/list')
  getCustomers() {
    return this.ordersService.getCustomers();
  }

  @Roles('MERCHANDISER', 'MANAGING_DIRECTOR', 'DIRECTOR_PARTNER', 'GENERAL_MANAGER')
  @Post('customers')
  createCustomer(@Body() data: any, @CurrentUser() user: any) {
    return this.ordersService.createCustomer(data, user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.ordersService.findOne(id, user);
  }

  @Post(':id/workflow/advance')
  advanceWorkflow(
    @Param('id') id: string,
    @Body() dto: AdvanceWorkflowDto,
    @CurrentUser() user: any,
  ) {
    return this.ordersService.advanceWorkflow(id, dto, user);
  }
}
