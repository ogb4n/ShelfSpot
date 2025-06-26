import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { FavouritesService } from './favourites.service';
import { Prisma } from '@prisma/client';

@Controller('favourites')
export class FavouritesController {
  constructor(private readonly favouritesService: FavouritesService) {}

  @Post()
  create(@Body() createFavouriteDto: Prisma.FavouriteCreateInput) {
    return this.favouritesService.create(createFavouriteDto);
  }

  @Post('by-item-user')
  createByItemAndUser(@Body() body: { itemId: number; userName: string }) {
    return this.favouritesService.createByItemAndUser(
      body.itemId,
      body.userName,
    );
  }

  @Get()
  findAll(@Query('userId') userId?: string) {
    if (userId) {
      return this.favouritesService.findByUser(+userId);
    }
    return this.favouritesService.findAll();
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.favouritesService.remove(+id);
  }

  @Delete('by-item-user')
  removeByItemAndUser(@Body() body: { itemId: number; userName: string }) {
    return this.favouritesService.removeByItemAndUser(
      body.itemId,
      body.userName,
    );
  }
}
