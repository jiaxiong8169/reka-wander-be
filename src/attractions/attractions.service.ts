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
import { Review, ReviewDocument } from 'src/schemas/review.schema';
import { ReviewDto } from 'src/dto/review.dto';
import { RecommenderFeatures } from 'src/dto/recommender-features.dto';

@Injectable()
export class AttractionsService {
  constructor(
    @InjectModel(Attraction.name)
    private attractionModel: mongoose.Model<AttractionDocument>,
    @InjectModel(Review.name)
    private reviewModel: mongoose.Model<ReviewDocument>,
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

  async findAttractionsByFeatures(
    features: RecommenderFeatures,
  ): Promise<Attraction[]> {
    // and query
    const andQuery: any = [
      { 'recommenderFeatures.maxPax': { $gte: features.maxPax } },
      { 'recommenderFeatures.minBudget': { $lte: features.minBudget } },
    ];
    if (features.kids) andQuery.push({ 'recommenderFeatures.kids': true });

    const query = this.attractionModel.find({
      $and: andQuery,
    });

    return query.exec();
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

  async reviewAttraction(@Body() reviewDto: ReviewDto) {
    const session = await this.connection.startSession();

    await session.withTransaction(async () => {
      // check if attraction exists
      const attraction = await this.attractionModel.findOne({
        _id: reviewDto.targetId,
      });
      if (!attraction) {
        throw new BadRequestException('Invalid Attraction');
      }
      // get review document if exists
      const review = await this.reviewModel.findOne({
        targetId: reviewDto.targetId,
        userId: reviewDto.userId,
      });
      // if exists, update review document, rateCount, rateValue, avgRating
      if (review) {
        const diff = reviewDto.rating - review.rating;
        const newAvgRating = (
          (attraction.rateValue + diff) /
          attraction.rateCount
        ).toFixed(2);
        // update review document
        await this.reviewModel.updateOne(
          { _id: review.id },
          {
            $set: {
              userName: reviewDto.userName,
              userProfileSrc: reviewDto.userProfileSrc,
              timestamp: reviewDto.timestamp,
              contents: reviewDto.contents,
            },
            $inc: { rating: diff },
          },
        );

        // update attraction
        return await this.attractionModel.updateOne(
          { _id: reviewDto.targetId },
          {
            $set: {
              avgRating: newAvgRating,
            },
            $inc: { rateValue: diff },
          },
        );
      } else {
        // if not exists, create review document, rateCount, rateValue, avgRating
        // create review document
        const newAvgRating = (
          (attraction.rateValue + reviewDto.rating) /
          (attraction.rateCount + 1)
        ).toFixed(2);
        const createdReview = new this.reviewModel(reviewDto);
        await createdReview.save();

        // update attraction
        return await this.attractionModel.updateOne(
          { _id: reviewDto.targetId },
          {
            $set: {
              avgRating: newAvgRating,
            },
            $inc: { rateCount: 1, rateValue: reviewDto.rating },
          },
        );
      }
    });

    session.endSession();
  }
}
