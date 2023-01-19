import { Module } from '@nestjs/common';
import { Reservation, ReservationSchema } from 'src/schemas/reservation.schema';
import { Hotel, HotelSchema } from 'src/schemas/hotel.schema';
import { Homestay, HomestaySchema } from 'src/schemas/homestay.schema';
import { Vehicle, VehicleSchema } from 'src/schemas/vehicle.schema';
import { Guide, GuideSchema } from 'src/schemas/guide.schema';
import { ReservationsController } from './reservation.controller';
import { ReservationsService } from './reservation.service';
import { MongooseModule } from '@nestjs/mongoose';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Reservation.name, schema: ReservationSchema },
      { name: Hotel.name, schema: HotelSchema },
      { name: Homestay.name, schema: HomestaySchema },
      { name: Vehicle.name, schema: VehicleSchema },
      { name: Guide.name, schema: GuideSchema },
    ]),
  ],
  controllers: [ReservationsController],
  providers: [ReservationsService],
  exports: [ReservationsService],
})
export class ReservationsModule {}
