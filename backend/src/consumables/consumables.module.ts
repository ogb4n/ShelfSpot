import { Module } from '@nestjs/common';
import { ConsumablesService } from './consumables.service';
import { ConsumablesController } from './consumables.controller';
import { PrismaModule } from '../prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [ConsumablesService],
  controllers: [ConsumablesController],
})
export class ConsumablesModule {}
