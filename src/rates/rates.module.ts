import { Module } from '@nestjs/common';
import { Rate, RateSchema } from 'src/schemas/rate.schema';
import { RatesController } from './rates.controller';
import { RatesService } from './rates.service';
import { MongooseModule } from '@nestjs/mongoose';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Rate.name, schema: RateSchema }]),
  ],
  controllers: [RatesController],
  providers: [RatesService],
  exports: [RatesService],
})
export class RatesModule {}
