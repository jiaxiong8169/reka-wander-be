import { Module } from '@nestjs/common';
import { Guide, GuideSchema } from 'src/schemas/guide.schema';
import { GuidesController } from './guides.controller';
import { GuidesService } from './guides.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Review, ReviewSchema } from 'src/schemas/review.schema';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Guide.name, schema: GuideSchema },
      { name: Review.name, schema: ReviewSchema },
    ]),
  ],
  controllers: [GuidesController],
  providers: [GuidesService],
  exports: [GuidesService],
})
export class GuidesModule {}
