import { Injectable } from '@nestjs/common';
import { Body } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { HomestayDto } from 'src/dto/homestay.dto';
import { ExceptionMessage } from 'src/exceptions/exception-message.enum';
import { Homestay, HomestayDocument } from 'src/schemas/homestay.schema';
import { SearchQueryDto } from 'src/dto/search-params.dto';
import { processSearchAndFilter } from 'src/utils';
import { SEARCH_FIELDS } from 'src/constants';
import { NearbyParamsDto } from 'src/dto/nearby-params.dto';
import { TripDto } from 'src/dto/trip.dto';

@Injectable()
export class HomestaysService {
  constructor(
    @InjectModel(Homestay.name)
    private homestayModel: mongoose.Model<HomestayDocument>,
  ) {}

  async findOneHomestayById(
    homestayId: mongoose.Types.ObjectId | string,
  ): Promise<Homestay> {
    return this.homestayModel
      .findOne({
        _id: homestayId,
      })
      .orFail(new Error(ExceptionMessage.HomestayNotFound));
  }

  async updateHomestayById(
    homestayId: mongoose.Types.ObjectId,
    req: HomestayDto,
  ): Promise<Homestay> {
    return this.homestayModel.findOneAndUpdate({ _id: homestayId }, req, {
      new: true,
      runValidators: true,
    });
  }

  async create(@Body() homestayDto: HomestayDto): Promise<Homestay> {
    const createdHomestay = new this.homestayModel(homestayDto);
    return createdHomestay.save().catch(() => {
      throw Error(ExceptionMessage.HomestayExist);
    });
  }

  async deleteOneHomestayByHomestayId(
    homestayId: mongoose.Types.ObjectId,
  ): Promise<Homestay> {
    return this.homestayModel
      .findOneAndDelete({ _id: homestayId })
      .orFail(new Error(ExceptionMessage.CannotDelete));
  }

  async findAllHomestays(params: SearchQueryDto): Promise<Homestay[]> {
    // fallback to empty filter if filter is not provided
    // find with empty filter will return all documents
    const { sort, offset, limit, filter = {} } = params;
    const effectiveFilter = processSearchAndFilter(
      filter,
      SEARCH_FIELDS['homestays'],
    );
    let query = this.homestayModel.find(effectiveFilter);
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

  async getHomestaysResultCount(params: SearchQueryDto): Promise<number> {
    const { filter = {} } = params;
    const effectiveFilter = processSearchAndFilter(
      filter,
      SEARCH_FIELDS['homestays'],
    );
    return this.homestayModel.find(effectiveFilter).countDocuments();
  }

  async findNearbyHomestays(params: NearbyParamsDto): Promise<Homestay[]> {
    const { long, lat, distance, sort, offset, limit } = params;
    // find nearby with nearSphere
    let query = this.homestayModel.find({
      loc: {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: [long, lat],
          },
          $minDistance: 0, // minimum 0 meters
          $maxDistance: distance ? distance : 5000, // default 5000 meters
        },
      },
    });
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

  async findHomestayByFeatures(trip: TripDto) {
    if (!trip.rentHomestay || trip.days <= 0) return null;
    const targetPrice = trip.kids ? 'priceWithBaby' : 'price';
    let query = this.homestayModel.find({
      loc: {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: [trip.long, trip.lat],
          },
          $minDistance: 0, // minimum 0 meters
          $maxDistance: 300000, // default 300 kilometers
        },
      },
    });
    query = query.sort('minPrice');

    const homestays = await query.exec();

    homestays.forEach((homestay) => {
      homestay.rooms.forEach((room) => {
        if (
          room.pax >= trip.pax &&
          room.availability > 0 &&
          room[targetPrice] <= trip.budget
        ) {
          trip.homestay = homestay['_id'];
          trip.homestayObject = homestay;
          trip.rooms = [room['_id']];
          trip.roomObjects = [room];
          trip.kids
            ? (trip.budget -= room.priceWithBaby)
            : (trip.budget -= room.price);
          return;
        }
      });
    });
  }
}
