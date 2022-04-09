import { Module } from '@nestjs/common';
import { Trip, TripSchema } from 'src/schemas/trip.schema';
import { TripsController } from './trips.controller';
import { TripsService } from './trips.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AttractionsModule } from 'src/attractions/attractions.module';
import { HotelsModule } from 'src/hotels/hotels.module';
import { RestaurantsModule } from 'src/restaurants/restaurants.module';
import { User, UserSchema } from 'src/schemas/user.schema';
import { HomestaysModule } from 'src/homestays/homestays.module';
import { VehiclesModule } from 'src/vehicles/vehicles.module';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Trip.name, schema: TripSchema },
      { name: User.name, schema: UserSchema },
    ]),
    AttractionsModule,
    HotelsModule,
    RestaurantsModule,
    HomestaysModule,
    VehiclesModule,
  ],
  controllers: [TripsController],
  providers: [TripsService],
  exports: [TripsService],
})
export class TripsModule {}
