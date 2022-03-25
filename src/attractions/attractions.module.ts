import { Module } from '@nestjs/common';
import { Attraction, AttractionSchema } from 'src/schemas/attraction.schema';
import { AttractionsController } from './attractions.controller';
import { AttractionsService } from './attractions.service';
import { MongooseModule } from '@nestjs/mongoose';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Attraction.name, schema: AttractionSchema },
    ]),
  ],
  controllers: [AttractionsController],
  providers: [AttractionsService],
  exports: [AttractionsService],
})
export class AttractionsModule {}
