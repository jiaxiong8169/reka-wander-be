import { BadRequestException, Injectable } from '@nestjs/common';
import { Body } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { AccommodationDto } from 'src/dto/accommodation.dto';
import { ExceptionMessage } from 'src/exceptions/exception-message.enum';
import {
  Accommodation,
  AccommodationDocument,
} from 'src/schemas/accommodation.schema';
import { SearchQueryDto } from 'src/dto/search-params.dto';
import { processSearchAndFilter } from 'src/utils';
import { SEARCH_FIELDS } from 'src/constants';
import { NearbyParamsDto } from 'src/dto/nearby-params.dto';
import { Rate, RateDocument } from 'src/schemas/rate.schema';
import { RateDto } from 'src/dto/rate.dto';

@Injectable()
export class AccommodationsService {
  constructor(
    @InjectModel(Accommodation.name)
    private accommodationModel: mongoose.Model<AccommodationDocument>,
    @InjectModel(Rate.name)
    private rateModel: mongoose.Model<RateDocument>,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}

  async findOneAccommodationById(
    accommodationId: mongoose.Types.ObjectId | string,
  ): Promise<Accommodation> {
    return this.accommodationModel
      .findOne({
        _id: accommodationId,
      })
      .orFail(new Error(ExceptionMessage.AccommodationNotFound));
  }

  async updateAccommodationById(
    accommodationId: mongoose.Types.ObjectId,
    req: AccommodationDto,
  ): Promise<Accommodation> {
    return this.accommodationModel.findOneAndUpdate(
      { _id: accommodationId },
      req,
      {
        new: true,
        runValidators: true,
      },
    );
  }

  async create(
    @Body() accommodationDto: AccommodationDto,
  ): Promise<Accommodation> {
    const createdAccommodation = new this.accommodationModel(accommodationDto);
    return createdAccommodation.save().catch(() => {
      throw Error(ExceptionMessage.AccommodationExist);
    });
  }

  async deleteOneAccommodationByAccommodationId(
    accommodationId: mongoose.Types.ObjectId,
  ): Promise<Accommodation> {
    return this.accommodationModel
      .findOneAndDelete({ _id: accommodationId })
      .orFail(new Error(ExceptionMessage.CannotDelete));
  }

  async findAllAccommodations(
    params: SearchQueryDto,
  ): Promise<Accommodation[]> {
    // fallback to empty filter if filter is not provided
    // find with empty filter will return all documents
    const { sort, offset, limit, filter = {} } = params;
    const effectiveFilter = processSearchAndFilter(
      filter,
      SEARCH_FIELDS['accommodations'],
    );
    let query = this.accommodationModel.find(effectiveFilter);
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

  async getAccommodationsResultCount(params: SearchQueryDto): Promise<number> {
    const { filter = {} } = params;
    const effectiveFilter = processSearchAndFilter(
      filter,
      SEARCH_FIELDS['accommodations'],
    );
    return this.accommodationModel.find(effectiveFilter).countDocuments();
  }

  async findNearbyAccommodations(
    params: NearbyParamsDto,
  ): Promise<Accommodation[]> {
    const { long, lat, distance } = params;
    // find nearby with nearSphere
    const query = this.accommodationModel.find({
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

  async rateAccommodation(@Body() rateDto: RateDto) {
    const session = await this.connection.startSession();

    await session.withTransaction(async () => {
      // check if accommodation exists
      const accommodation = await this.accommodationModel.findOne({
        _id: rateDto.spotId,
      });
      if (!accommodation) {
        throw new BadRequestException('Invalid Accommodation');
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

        // update accommodation
        return await this.accommodationModel.updateOne(
          { _id: rateDto.spotId },
          { $inc: { rateValue: diff } },
        );
      } else {
        // if not exists, create rate document, rateCount and rateValue
        // create rate document
        const createdRate = new this.rateModel(rateDto);
        await createdRate.save();

        // update accommodation
        return await this.accommodationModel.updateOne(
          { _id: rateDto.spotId },
          { $inc: { rateCount: 1, rateValue: rateDto.value } },
        );
      }
    });

    session.endSession();
  }
}
