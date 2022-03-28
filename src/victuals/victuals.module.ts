import { Module } from '@nestjs/common';
import { Victual, VictualSchema } from 'src/schemas/victual.schema';
import { VictualsController } from './victuals.controller';
import { VictualsService } from './victuals.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Rate, RateSchema } from 'src/schemas/rate.schema';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Victual.name, schema: VictualSchema },
      { name: Rate.name, schema: RateSchema },
    ]),
  ],
  controllers: [VictualsController],
  providers: [VictualsService],
  exports: [VictualsService],
})
export class VictualsModule {}
