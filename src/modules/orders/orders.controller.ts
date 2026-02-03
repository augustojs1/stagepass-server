import { Body, Controller, Param, Post, Req, UseGuards } from '@nestjs/common';

import { OrdersService } from './orders.service';
import {
  CreateOrderDto,
  CreateOrderItemDto,
  CreateOrderResponseDto,
  createrOrderDtoSchema,
  createrOrderItemDtoSchema,
  OrderItemResponseDto,
} from './dto';
import { ZodValidationPipe } from '../shared/pipes';
import { JwtAuthGuard } from '../auth/guards';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Req() req,
    @Body(new ZodValidationPipe(createrOrderDtoSchema))
    createOrderDto: CreateOrderDto,
  ): Promise<CreateOrderResponseDto> {
    return await this.ordersService.create(req.user.sub, createOrderDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/:order_id/items')
  async createItem(
    @Req() req,
    @Param('order_id') order_id: string,
    @Body(new ZodValidationPipe(createrOrderItemDtoSchema))
    createOrderItemDto: CreateOrderItemDto,
  ): Promise<OrderItemResponseDto[]> {
    return await this.ordersService.createOrderItem(
      req.user.sub,
      order_id,
      createOrderItemDto,
    );
  }
}
