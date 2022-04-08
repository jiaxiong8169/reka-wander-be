import { Module } from '@nestjs/common';
import { Hotel, HotelSchema } from 'src/schemas/hotel.schema';
import { HotelsController } from './hotels.controller';
import { HotelsService } from './hotels.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Review, ReviewSchema } from 'src/schemas/review.schema';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Hotel.name, schema: HotelSchema },
      { name: Review.name, schema: ReviewSchema },
    ]),
  ],
  controllers: [HotelsController],
  providers: [HotelsService],
  exports: [HotelsService],
})
export class HotelsModule {}
