import { Module } from '@nestjs/common';
import { Guide, GuideSchema } from 'src/schemas/guide.schema';
import { GuidesController } from './guides.controller';
import { GuidesService } from './guides.service';
import { MongooseModule } from '@nestjs/mongoose';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Guide.name, schema: GuideSchema }]),
  ],
  controllers: [GuidesController],
  providers: [GuidesService],
  exports: [GuidesService],
})
export class GuidesModule {}
