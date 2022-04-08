import { BadRequestException, Injectable } from '@nestjs/common';
import { Body } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { HotelDto } from 'src/dto/hotel.dto';
import { ExceptionMessage } from 'src/exceptions/exception-message.enum';
import { Hotel, HotelDocument } from 'src/schemas/hotel.schema';
import { SearchQueryDto } from 'src/dto/search-params.dto';
import { processSearchAndFilter } from 'src/utils';
import { SEARCH_FIELDS } from 'src/constants';
import { NearbyParamsDto } from 'src/dto/nearby-params.dto';
import { Rate, RateDocument } from 'src/schemas/rate.schema';
import { RateDto } from 'src/dto/rate.dto';
import { RecommenderFeatures } from 'src/dto/recommender-features.dto';

@Injectable()
export class HotelsService {
  constructor(
    @InjectModel(Hotel.name)
    private hotelModel: mongoose.Model<HotelDocument>,
    @InjectModel(Rate.name)
    private rateModel: mongoose.Model<RateDocument>,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}

  async findOneHotelById(
    hotelId: mongoose.Types.ObjectId | string,
  ): Promise<Hotel> {
    return this.hotelModel
      .findOne({
        _id: hotelId,
      })
      .orFail(new Error(ExceptionMessage.HotelNotFound));
  }

  async findHotelsByFeatures(features: RecommenderFeatures): Promise<Hotel[]> {
    // and query
    const andQuery: any = [
      { 'recommenderFeatures.maxPax': { $gte: features.maxPax } },
      { 'recommenderFeatures.minBudget': { $lte: features.minBudget } },
    ];

    const query = this.hotelModel.find({
      $and: andQuery,
    });

    return query.exec();
  }

  async updateHotelById(
    hotelId: mongoose.Types.ObjectId,
    req: HotelDto,
  ): Promise<Hotel> {
    return this.hotelModel.findOneAndUpdate({ _id: hotelId }, req, {
      new: true,
      runValidators: true,
    });
  }

  async create(@Body() hotelDto: HotelDto): Promise<Hotel> {
    const createdHotel = new this.hotelModel(hotelDto);
    return createdHotel.save().catch(() => {
      throw Error(ExceptionMessage.HotelExist);
    });
  }

  async deleteOneHotelByHotelId(
    hotelId: mongoose.Types.ObjectId,
  ): Promise<Hotel> {
    return this.hotelModel
      .findOneAndDelete({ _id: hotelId })
      .orFail(new Error(ExceptionMessage.CannotDelete));
  }

  async findAllHotels(params: SearchQueryDto): Promise<Hotel[]> {
    // fallback to empty filter if filter is not provided
    // find with empty filter will return all documents
    const { sort, offset, limit, filter = {} } = params;
    const effectiveFilter = processSearchAndFilter(
      filter,
      SEARCH_FIELDS['hotels'],
    );
    let query = this.hotelModel.find(effectiveFilter);
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

  async getHotelsResultCount(params: SearchQueryDto): Promise<number> {
    const { filter = {} } = params;
    const effectiveFilter = processSearchAndFilter(
      filter,
      SEARCH_FIELDS['hotels'],
    );
    return this.hotelModel.find(effectiveFilter).countDocuments();
  }

  async findNearbyHotels(params: NearbyParamsDto): Promise<Hotel[]> {
    const { long, lat, distance } = params;
    // find nearby with nearSphere
    const query = this.hotelModel.find({
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
    return query.exec();
  }

  async rateHotel(@Body() rateDto: RateDto) {
    const session = await this.connection.startSession();

    await session.withTransaction(async () => {
      // check if hotel exists
      const hotel = await this.hotelModel.findOne({
        _id: rateDto.spotId,
      });
      if (!hotel) {
        throw new BadRequestException('Invalid Hotel');
      }
      // get rate document if exists
      const rate = await this.rateModel.findOne({
        spotId: rateDto.spotId,
        userId: rateDto.userId,
      });
      // if exists, update rate document, rateCount and rateValue
      if (rate) {
        const diff = rateDto.value - rate.value;
        // update rate document
        await this.rateModel.updateOne(
          { _id: rate.id },
          { $inc: { value: diff } },
        );

        // update hotel
        return await this.hotelModel.updateOne(
          { _id: rateDto.spotId },
          { $inc: { rateValue: diff } },
        );
      } else {
        // if not exists, create rate document, rateCount and rateValue
        // create rate document
        const createdRate = new this.rateModel(rateDto);
        await createdRate.save();

        // update hotel
        return await this.hotelModel.updateOne(
          { _id: rateDto.spotId },
          { $inc: { rateCount: 1, rateValue: rateDto.value } },
        );
      }
    });

    session.endSession();
  }
}
