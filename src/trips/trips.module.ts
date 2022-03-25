import { Module } from '@nestjs/common';
import { Trip, TripSchema } from 'src/schemas/trip.schema';
import { TripsController } from './trips.controller';
import { TripsService } from './trips.service';
import { MongooseModule } from '@nestjs/mongoose';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Trip.name, schema: TripSchema }]),
  ],
  controllers: [TripsController],
  providers: [TripsService],
  exports: [TripsService],
})
export class TripsModule {}
