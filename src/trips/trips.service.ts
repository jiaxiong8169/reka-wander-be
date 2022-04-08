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
import { RecommenderFeatures } from 'src/dto/recommender-features.dto';
import { AttractionsService } from 'src/attractions/attractions.service';
import { HotelsService } from 'src/hotels/hotels.service';
import { VictualsService } from 'src/victuals/victuals.service';
import { User, UserDocument } from 'src/schemas/user.schema';

@Injectable()
export class TripsService {
  constructor(
    @InjectModel(Trip.name)
    private tripModel: mongoose.Model<TripDocument>,
    private readonly attractionsService: AttractionsService,
    private readonly hotelsService: HotelsService,
    private readonly victualsService: VictualsService,
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
    // instantiate features
    const features = new RecommenderFeatures({
      maxPax: trip.pax,
      minBudget: trip.budget,
      kids: trip.kids,
      rentCar: trip.rentCar,
      rentHomestay: trip.rentHomestay,
      interests: trip.interests,
    });

    // get recommendations
    const hotels = await this.hotelsService.findHotelsByFeatures(features);
    const attractions = await this.attractionsService.findAttractionsByFeatures(
      features,
    );
    const victuals = await this.victualsService.findVictualsByFeatures(
      features,
    );
    trip.hotelObjects = hotels;
    trip.hotels = hotels.map((a) => a['id']);
    trip.attractionObjects = attractions;
    trip.attractions = attractions.map((a) => a['id']);
    trip.victualObjects = victuals;
    trip.victuals = victuals.map((a) => a['id']);

    const session = await this.connection.startSession();

    await session.withTransaction(async () => {
      // get user
      const user = await this.userModel.findOne({ _id: trip.userId });
      if (!user) throw new BadRequestException('Invalid User');

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
    });

    session.endSession();

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
    return createdTrip.save().catch(() => {
      throw Error(ExceptionMessage.TripExist);
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
