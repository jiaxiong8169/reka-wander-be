import { BadRequestException, Injectable } from '@nestjs/common';
import { Body } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { TripDto } from 'src/dto/trip.dto';
import { ExceptionMessage } from 'src/exceptions/exception-message.enum';
import { Trip, TripDocument } from 'src/schemas/trip.schema';
import { SearchQueryDto } from 'src/dto/search-params.dto';
import { processSearchAndFilter } from 'src/utils';
import { SEARCH_FIELDS } from 'src/constants';
import { AttractionsService } from 'src/attractions/attractions.service';
import { HotelsService } from 'src/hotels/hotels.service';
import { RestaurantsService } from 'src/restaurants/restaurants.service';
import { User, UserDocument } from 'src/schemas/user.schema';
import { HomestaysService } from 'src/homestays/homestays.service';
import { VehiclesService } from 'src/vehicles/vehicles.service';

@Injectable()
export class TripsService {
  constructor(
    @InjectModel(Trip.name)
    private tripModel: mongoose.Model<TripDocument>,
    private readonly attractionsService: AttractionsService,
    private readonly hotelsService: HotelsService,
    private readonly restaurantsService: RestaurantsService,
    private readonly homestaysService: HomestaysService,
    private readonly vehiclesService: VehiclesService,
    @InjectModel(User.name)
    private userModel: mongoose.Model<UserDocument>,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}

  async findOneTripById(
    tripId: mongoose.Types.ObjectId | string,
  ): Promise<Trip> {
    return this.tripModel
      .findOne({
        _id: tripId,
      })
      .orFail(new Error(ExceptionMessage.TripNotFound));
  }

  async getTripRecommendations(trip: TripDto): Promise<TripDto> {
    // get recommendations
    trip.previousBudget = trip.budget;
    await this.hotelsService.findHotelByFeatures(trip);
    await this.homestaysService.findHomestayByFeatures(trip);
    await this.vehiclesService.findVehicleByFeatures(trip);
    const attractions = await this.attractionsService.findAttractionsByFeatures(
      trip,
    );
    const restaurants = await this.restaurantsService.findRestaurantsByFeatures(
      trip,
    );

    // use 2 pointers method to give equal priority to restaurants and attractions
    trip.attractionObjects = [];
    trip.attractions = [];
    trip.restaurantObjects = [];
    trip.restaurants = [];
    let left1 = 0;
    let left2 = 0;
    let tmpBudget = trip.budget;
    let tmpHours = trip.hours;
    while (
      tmpBudget > 0 &&
      tmpHours > 0 &&
      left1 < restaurants.length &&
      left2 < attractions.length
    ) {
      if (left1 <= left2 && left1 !== -1) {
        // for restaurant, make sure that the price is within budget and hours within 2
        if (restaurants[left1].price * trip.pax <= tmpBudget && tmpHours >= 2) {
          trip.restaurants.push(restaurants[left1]['_id'].toString());
          trip.restaurantObjects.push(restaurants[left1]);
          tmpBudget -= restaurants[left1].price * trip.pax;
          tmpHours -= 2;
          left1++;
        } else {
          left1 = -1;
        }
      } else if (left2 !== -1) {
        // for attractions, make sure that the price is within budget and hours within trip.hours
        if (
          attractions[left2].price * trip.pax <= tmpBudget &&
          tmpHours >= attractions[left2].hours
        ) {
          trip.attractions.push(attractions[left2]['_id'].toString());
          trip.attractionObjects.push(attractions[left2]);
          tmpBudget -= attractions[left2].price * trip.pax;
          tmpHours -= attractions[left2].hours;
          left2++;
        } else {
          left2 = -1;
        }
      } else {
        break;
      }
    }

    while (left1 !== -1 && left1 < restaurants.length) {
      if (restaurants[left1].price * trip.pax <= tmpBudget && tmpHours >= 2) {
        trip.restaurants.push(restaurants[left1]['_id'].toString());
        trip.restaurantObjects.push(restaurants[left1]);
        tmpBudget -= restaurants[left1].price * trip.pax;
        tmpHours -= 2;
        left1++;
      } else {
        break;
      }
    }

    while (left2 !== -1 && left2 < attractions.length) {
      if (
        attractions[left2].price * trip.pax <= tmpBudget &&
        tmpHours >= attractions[left2].hours
      ) {
        trip.attractions.push(attractions[left2]['_id'].toString());
        trip.attractionObjects.push(attractions[left2]);
        tmpBudget -= attractions[left2].price * trip.pax;
        tmpHours -= attractions[left2].hours;
        left2++;
      } else {
        break;
      }
    }

    // set remaining budget
    trip.budget = tmpBudget;

    // create a trip only if trip userId exists
    if (trip.userId) {
      const session = await this.connection.startSession();

      await session.withTransaction(async () => {
        // get user
        try {
          const user = await this.userModel.findOne({ _id: trip.userId });

          // if user is found, create a new trip
          if (user) {
            // create a new trip
            const tripDb = await this.create(trip);
            trip.id = tripDb['id'];

            // add into user trip list
            user.trips.push(tripDb['id']);
            await this.userModel.findOneAndUpdate(
              { _id: user['id'] },
              { trips: user.trips },
              {
                new: true,
                runValidators: true,
              },
            );
          }
        } catch (err) {}
      });

      session.endSession();
    }

    return trip;
  }

  async updateTripById(
    tripId: mongoose.Types.ObjectId,
    req: TripDto,
  ): Promise<Trip> {
    return this.tripModel.findOneAndUpdate({ _id: tripId }, req, {
      new: true,
      runValidators: true,
    });
  }

  async create(@Body() tripDto: TripDto): Promise<Trip> {
    const createdTrip = new this.tripModel(tripDto);
    return createdTrip.save().catch((e) => {
      throw Error(e.message);
    });
  }

  async deleteOneTripByTripId(tripId: mongoose.Types.ObjectId): Promise<Trip> {
    return this.tripModel
      .findOneAndDelete({ _id: tripId })
      .orFail(new Error(ExceptionMessage.CannotDelete));
  }

  async findAllTrips(params: SearchQueryDto): Promise<Trip[]> {
    // fallback to empty filter if filter is not provided
    // find with empty filter will return all documents
    const { sort, offset, limit, filter = {} } = params;
    const effectiveFilter = processSearchAndFilter(
      filter,
      SEARCH_FIELDS['trips'],
    );
    let query = this.tripModel.find(effectiveFilter);
    if (sort) {
      query = query.sort(sort);
    }
    if (offset) {
      query = query.skip(offset);
    }
    if (limit) {
      query.limit(limit);
    }

    return query.exec();
  }

  async getTripsResultCount(params: SearchQueryDto): Promise<number> {
    const { filter = {} } = params;
    const effectiveFilter = processSearchAndFilter(
      filter,
      SEARCH_FIELDS['trips'],
    );
    return this.tripModel.find(effectiveFilter).countDocuments();
  }
}
