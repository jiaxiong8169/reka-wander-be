import { Injectable } from '@nestjs/common';
import { Body } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { TripDto } from 'src/dto/trip.dto';
import { ExceptionMessage } from 'src/exceptions/exception-message.enum';
import { Trip, TripDocument } from 'src/schemas/trip.schema';
import { SearchQueryDto } from 'src/dto/search-params.dto';
import { processSearchAndFilter } from 'src/utils';
import { SEARCH_FIELDS } from 'src/constants';

@Injectable()
export class TripsService {
  constructor(
    @InjectModel(Trip.name)
    private tripModel: mongoose.Model<TripDocument>,
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
