import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma.module';
import { ItemsModule } from './items/items.module';

@Module({
  imports: [PrismaModule, ItemsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
