import { Controller, Param, Patch, Req, UseGuards } from '@nestjs/common';

import { TicketsService } from './tickets.service';
import { JwtAuthGuard } from '../auth/guards';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @UseGuards(JwtAuthGuard)
  @Patch('/:code/validate')
  async createItem(@Req() req, @Param('code') code: string) {
    return await this.ticketsService.validate(req.user.sub, code);
  }
}
