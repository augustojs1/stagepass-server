import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';

import { OrdersService } from './orders.service';
import {
  CreateOrderDto,
  CreateOrderResponseDto,
  createrOrderDtoSchema,
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
}
