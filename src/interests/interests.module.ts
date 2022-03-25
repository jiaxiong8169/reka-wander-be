import { Module } from '@nestjs/common';
import { Interest, InterestSchema } from 'src/schemas/interest.schema';
import { InterestsController } from './interests.controller';
import { InterestsService } from './interests.service';
import { MongooseModule } from '@nestjs/mongoose';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Interest.name, schema: InterestSchema },
    ]),
  ],
  controllers: [InterestsController],
  providers: [InterestsService],
  exports: [InterestsService],
})
export class InterestsModule {}
