import { Module } from '@nestjs/common';
import {
  Accommodation,
  AccommodationSchema,
} from 'src/schemas/accommodation.schema';
import { AccommodationsController } from './accommodations.controller';
import { AccommodationsService } from './accommodations.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Rate, RateSchema } from 'src/schemas/rate.schema';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Accommodation.name, schema: AccommodationSchema },
      { name: Rate.name, schema: RateSchema },
    ]),
  ],
  controllers: [AccommodationsController],
  providers: [AccommodationsService],
  exports: [AccommodationsService],
})
export class AccommodationsModule {}
