import { Module } from '@nestjs/common';
import { Victual, VictualSchema } from 'src/schemas/victual.schema';
import { VictualsController } from './victuals.controller';
import { VictualsService } from './victuals.service';
import { MongooseModule } from '@nestjs/mongoose';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Victual.name, schema: VictualSchema }]),
  ],
  controllers: [VictualsController],
  providers: [VictualsService],
  exports: [VictualsService],
})
export class VictualsModule {}
