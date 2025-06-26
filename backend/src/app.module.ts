import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma.module';
import { ItemsModule } from './items/items.module';
import { RoomsModule } from './rooms/rooms.module';
import { PlacesModule } from './places/places.module';

@Module({
  imports: [PrismaModule, ItemsModule, RoomsModule, PlacesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
