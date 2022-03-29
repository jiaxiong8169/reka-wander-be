import { BadRequestException, Injectable } from '@nestjs/common';
import { Body } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { VictualDto } from 'src/dto/victual.dto';
import { ExceptionMessage } from 'src/exceptions/exception-message.enum';
import { Victual, VictualDocument } from 'src/schemas/victual.schema';
import { SearchQueryDto } from 'src/dto/search-params.dto';
import { processSearchAndFilter } from 'src/utils';
import { SEARCH_FIELDS } from 'src/constants';
import { NearbyParamsDto } from 'src/dto/nearby-params.dto';
import { RateDto } from 'src/dto/rate.dto';
import { Rate, RateDocument } from 'src/schemas/rate.schema';
import { RecommenderFeatures } from 'src/dto/recommender-features.dto';

@Injectable()
export class VictualsService {
  constructor(
    @InjectModel(Victual.name)
    private victualModel: mongoose.Model<VictualDocument>,
    @InjectModel(Rate.name)
    private rateModel: mongoose.Model<RateDocument>,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}

  async findOneVictualById(
    victualId: mongoose.Types.ObjectId | string,
  ): Promise<Victual> {
    return this.victualModel
      .findOne({
        _id: victualId,
      })
      .orFail(new Error(ExceptionMessage.VictualNotFound));
  }

  async findVictualsByFeatures(
    features: RecommenderFeatures,
  ): Promise<Victual[]> {
    // and query
    const andQuery: any = [
      { 'recommenderFeatures.maxPax': { $gte: features.maxPax } },
      { 'recommenderFeatures.minBudget': { $lte: features.minBudget } },
    ];

    const query = this.victualModel.find({
      $and: andQuery,
    });

    return query.exec();
  }

  async updateVictualById(
    victualId: mongoose.Types.ObjectId,
    req: VictualDto,
  ): Promise<Victual> {
    return this.victualModel.findOneAndUpdate({ _id: victualId }, req, {
      new: true,
      runValidators: true,
    });
  }

  async create(@Body() victualDto: VictualDto): Promise<Victual> {
    const createdVictual = new this.victualModel(victualDto);
    return createdVictual.save().catch(() => {
      throw Error(ExceptionMessage.VictualExist);
    });
  }

  async deleteOneVictualByVictualId(
    victualId: mongoose.Types.ObjectId,
  ): Promise<Victual> {
    return this.victualModel
      .findOneAndDelete({ _id: victualId })
      .orFail(new Error(ExceptionMessage.CannotDelete));
  }

  async findAllVictuals(params: SearchQueryDto): Promise<Victual[]> {
    // fallback to empty filter if filter is not provided
    // find with empty filter will return all documents
    const { sort, offset, limit, filter = {} } = params;
    const effectiveFilter = processSearchAndFilter(
      filter,
      SEARCH_FIELDS['victuals'],
    );
    let query = this.victualModel.find(effectiveFilter);
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

  async getVictualsResultCount(params: SearchQueryDto): Promise<number> {
    const { filter = {} } = params;
    const effectiveFilter = processSearchAndFilter(
      filter,
      SEARCH_FIELDS['victuals'],
    );
    return this.victualModel.find(effectiveFilter).countDocuments();
  }

  async findNearbyVictuals(params: NearbyParamsDto): Promise<Victual[]> {
    const { long, lat, distance } = params;
    // find nearby with nearSphere
    const query = this.victualModel.find({
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

  async rateVictual(@Body() rateDto: RateDto) {
    const session = await this.connection.startSession();

    await session.withTransaction(async () => {
      // check if victual exists
      const victual = await this.victualModel.findOne({
        _id: rateDto.spotId,
      });
      if (!victual) {
        throw new BadRequestException('Invalid Victual');
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

        // update victual
        return await this.victualModel.updateOne(
          { _id: rateDto.spotId },
          { $inc: { rateValue: diff } },
        );
      } else {
        // if not exists, create rate document, rateCount and rateValue
        // create rate document
        const createdRate = new this.rateModel(rateDto);
        await createdRate.save();

        // update victual
        return await this.victualModel.updateOne(
          { _id: rateDto.spotId },
          { $inc: { rateCount: 1, rateValue: rateDto.value } },
        );
      }
    });

    session.endSession();
  }
}
