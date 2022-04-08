import { Module } from '@nestjs/common';
import { Attraction, AttractionSchema } from 'src/schemas/attraction.schema';
import { AttractionsController } from './attractions.controller';
import { AttractionsService } from './attractions.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Review, ReviewSchema } from 'src/schemas/review.schema';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Attraction.name, schema: AttractionSchema },
      { name: Review.name, schema: ReviewSchema },
    ]),
  ],
  controllers: [AttractionsController],
  providers: [AttractionsService],
  exports: [AttractionsService],
})
export class AttractionsModule {}
