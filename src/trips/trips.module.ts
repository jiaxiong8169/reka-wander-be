import { Module } from '@nestjs/common';
import { Trip, TripSchema } from 'src/schemas/trip.schema';
import { TripsController } from './trips.controller';
import { TripsService } from './trips.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AttractionsModule } from 'src/attractions/attractions.module';
import { AccommodationsModule } from 'src/accommodations/accommodations.module';
import { VictualsModule } from 'src/victuals/victuals.module';
import { User, UserSchema } from 'src/schemas/user.schema';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Trip.name, schema: TripSchema },
      { name: User.name, schema: UserSchema },
    ]),
    AttractionsModule,
    AccommodationsModule,
    VictualsModule,
  ],
  controllers: [TripsController],
  providers: [TripsService],
  exports: [TripsService],
})
export class TripsModule {}
