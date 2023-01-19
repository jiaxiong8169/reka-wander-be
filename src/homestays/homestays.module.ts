import { Module } from '@nestjs/common';
import { Homestay, HomestaySchema } from 'src/schemas/homestay.schema';
import { HomestaysController } from './homestays.controller';
import { HomestaysService } from './homestays.service';
import { MongooseModule } from '@nestjs/mongoose';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Homestay.name, schema: HomestaySchema },
    ]),
  ],
  controllers: [HomestaysController],
  providers: [HomestaysService],
  exports: [HomestaysService],
})
export class HomestaysModule {}
