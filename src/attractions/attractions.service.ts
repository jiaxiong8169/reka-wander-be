import { BadRequestException, Injectable } from '@nestjs/common';
import { Body } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { AttractionDto } from 'src/dto/attraction.dto';
import { ExceptionMessage } from 'src/exceptions/exception-message.enum';
import { Attraction, AttractionDocument } from 'src/schemas/attraction.schema';
import { SearchQueryDto } from 'src/dto/search-params.dto';
import { processSearchAndFilter } from 'src/utils';
import { SEARCH_FIELDS } from 'src/constants';
import { NearbyParamsDto } from 'src/dto/nearby-params.dto';
import { Rate, RateDocument } from 'src/schemas/rate.schema';
import { RateDto } from 'src/dto/rate.dto';

@Injectable()
export class AttractionsService {
  constructor(
    @InjectModel(Attraction.name)
    private attractionModel: mongoose.Model<AttractionDocument>,
    @InjectModel(Rate.name)
    private rateModel: mongoose.Model<RateDocument>,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}

  async findOneAttractionById(
    attractionId: mongoose.Types.ObjectId | string,
  ): Promise<Attraction> {
    return this.attractionModel
      .findOne({
        _id: attractionId,
      })
      .orFail(new Error(ExceptionMessage.AttractionNotFound));
  }

  async updateAttractionById(
    attractionId: mongoose.Types.ObjectId,
    req: AttractionDto,
  ): Promise<Attraction> {
    return this.attractionModel.findOneAndUpdate({ _id: attractionId }, req, {
      new: true,
      runValidators: true,
    });
  }

  async create(@Body() attractionDto: AttractionDto): Promise<Attraction> {
    const createdAttraction = new this.attractionModel(attractionDto);
    return createdAttraction.save().catch(() => {
      throw Error(ExceptionMessage.AttractionExist);
    });
  }

  async deleteOneAttractionByAttractionId(
    attractionId: mongoose.Types.ObjectId,
  ): Promise<Attraction> {
    return this.attractionModel
      .findOneAndDelete({ _id: attractionId })
      .orFail(new Error(ExceptionMessage.CannotDelete));
  }

  async findAllAttractions(params: SearchQueryDto): Promise<Attraction[]> {
    // fallback to empty filter if filter is not provided
    // find with empty filter will return all documents
    const { sort, offset, limit, filter = {} } = params;
    const effectiveFilter = processSearchAndFilter(
      filter,
      SEARCH_FIELDS['attractions'],
    );
    let query = this.attractionModel.find(effectiveFilter);
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

  async getAttractionsResultCount(params: SearchQueryDto): Promise<number> {
    const { filter = {} } = params;
    const effectiveFilter = processSearchAndFilter(
      filter,
      SEARCH_FIELDS['attractions'],
    );
    return this.attractionModel.find(effectiveFilter).countDocuments();
  }

  async findNearbyAttractions(params: NearbyParamsDto): Promise<Attraction[]> {
    const { long, lat, distance } = params;
    // find nearby with nearSphere
    const query = this.attractionModel.find({
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

  async rateAttraction(@Body() rateDto: RateDto) {
    const session = await this.connection.startSession();

    await session.withTransaction(async () => {
      // check if attraction exists
      const attraction = await this.attractionModel.findOne({
        _id: rateDto.spotId,
      });
      if (!attraction) {
        throw new BadRequestException('Invalid Attraction');
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

        // update attraction
        return await this.attractionModel.updateOne(
          { _id: rateDto.spotId },
          { $inc: { rateValue: diff } },
        );
      } else {
        // if not exists, create rate document, rateCount and rateValue
        // create rate document
        const createdRate = new this.rateModel(rateDto);
        await createdRate.save();

        // update attraction
        return await this.attractionModel.updateOne(
          { _id: rateDto.spotId },
          { $inc: { rateCount: 1, rateValue: rateDto.value } },
        );
      }
    });

    session.endSession();
  }
}
