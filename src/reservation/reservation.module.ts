import { Module } from '@nestjs/common';
import { Reservation, ReservationSchema } from 'src/schemas/reservation.schema';
import { ReservationsController } from './reservation.controller';
import { ReservationsService } from './reservation.service';
import { MongooseModule } from '@nestjs/mongoose';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Reservation.name, schema: ReservationSchema },
    ]),
  ],
  controllers: [ReservationsController],
  providers: [ReservationsService],
  exports: [ReservationsService],
})
export class ReservationsModule {}
