import { Module } from '@nestjs/common';
import { Attraction, AttractionSchema } from 'src/schemas/attraction.schema';
import { AttractionsController } from './attractions.controller';
import { AttractionsService } from './attractions.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Rate, RateSchema } from 'src/schemas/rate.schema';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Attraction.name, schema: AttractionSchema },
      { name: Rate.name, schema: RateSchema },
    ]),
  ],
  controllers: [AttractionsController],
  providers: [AttractionsService],
  exports: [AttractionsService],
})
export class AttractionsModule {}
