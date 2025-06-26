import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ConsumablesService } from './consumables.service';
import { Prisma } from '@prisma/client';

@Controller('consumables')
export class ConsumablesController {
  constructor(private readonly consumablesService: ConsumablesService) {}

  @Post()
  create(@Body() createConsumableDto: Prisma.ItemCreateInput) {
    return this.consumablesService.create(createConsumableDto);
  }

  @Get()
  findAll() {
    return this.consumablesService.findAll();
  }

  @Get('low-stock')
  findLowStock(@Query('threshold') threshold?: string) {
    const thresholdValue = threshold ? parseInt(threshold, 10) : 5;
    return this.consumablesService.findLowStock(thresholdValue);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.consumablesService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateConsumableDto: Prisma.ItemUpdateInput,
  ) {
    return this.consumablesService.update(+id, updateConsumableDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.consumablesService.remove(+id);
  }
}
