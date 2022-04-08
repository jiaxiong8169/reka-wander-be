import { BadRequestException, Injectable } from '@nestjs/common';
import { Body } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { RestaurantDto } from 'src/dto/restaurant.dto';
import { ExceptionMessage } from 'src/exceptions/exception-message.enum';
import { Restaurant, RestaurantDocument } from 'src/schemas/restaurant.schema';
import { SearchQueryDto } from 'src/dto/search-params.dto';
import { processSearchAndFilter } from 'src/utils';
import { SEARCH_FIELDS } from 'src/constants';
import { NearbyParamsDto } from 'src/dto/nearby-params.dto';
import { Review, ReviewDocument } from 'src/schemas/review.schema';
import { ReviewDto } from 'src/dto/review.dto';
import { RecommenderFeatures } from 'src/dto/recommender-features.dto';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectModel(Restaurant.name)
    private restaurantModel: mongoose.Model<RestaurantDocument>,
    @InjectModel(Review.name)
    private reviewModel: mongoose.Model<ReviewDocument>,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}

  async findOneRestaurantById(
    restaurantId: mongoose.Types.ObjectId | string,
  ): Promise<Restaurant> {
    return this.restaurantModel
      .findOne({
        _id: restaurantId,
      })
      .orFail(new Error(ExceptionMessage.RestaurantNotFound));
  }

  async findRestaurantsByFeatures(
    features: RecommenderFeatures,
  ): Promise<Restaurant[]> {
    // and query
    const andQuery: any = [
      { 'recommenderFeatures.maxPax': { $gte: features.maxPax } },
      { 'recommenderFeatures.minBudget': { $lte: features.minBudget } },
    ];

    const query = this.restaurantModel.find({
      $and: andQuery,
    });

    return query.exec();
  }

  async updateRestaurantById(
    restaurantId: mongoose.Types.ObjectId,
    req: RestaurantDto,
  ): Promise<Restaurant> {
    return this.restaurantModel.findOneAndUpdate({ _id: restaurantId }, req, {
      new: true,
      runValidators: true,
    });
  }

  async create(@Body() restaurantDto: RestaurantDto): Promise<Restaurant> {
    const createdRestaurant = new this.restaurantModel(restaurantDto);
    return createdRestaurant.save().catch(() => {
      throw Error(ExceptionMessage.RestaurantExist);
    });
  }

  async deleteOneRestaurantByRestaurantId(
    restaurantId: mongoose.Types.ObjectId,
  ): Promise<Restaurant> {
    return this.restaurantModel
      .findOneAndDelete({ _id: restaurantId })
      .orFail(new Error(ExceptionMessage.CannotDelete));
  }

  async findAllRestaurants(params: SearchQueryDto): Promise<Restaurant[]> {
    // fallback to empty filter if filter is not provided
    // find with empty filter will return all documents
    const { sort, offset, limit, filter = {} } = params;
    const effectiveFilter = processSearchAndFilter(
      filter,
      SEARCH_FIELDS['restaurants'],
    );
    let query = this.restaurantModel.find(effectiveFilter);
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

  async getRestaurantsResultCount(params: SearchQueryDto): Promise<number> {
    const { filter = {} } = params;
    const effectiveFilter = processSearchAndFilter(
      filter,
      SEARCH_FIELDS['restaurants'],
    );
    return this.restaurantModel.find(effectiveFilter).countDocuments();
  }

  async findNearbyRestaurants(params: NearbyParamsDto): Promise<Restaurant[]> {
    const { long, lat, distance } = params;
    // find nearby with nearSphere
    const query = this.restaurantModel.find({
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

  async reviewRestaurant(@Body() reviewDto: ReviewDto) {
    const session = await this.connection.startSession();

    await session.withTransaction(async () => {
      // check if restaurant exists
      const restaurant = await this.restaurantModel.findOne({
        _id: reviewDto.targetId,
      });
      if (!restaurant) {
        throw new BadRequestException('Invalid Restaurant');
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
          (restaurant.rateValue + diff) /
          restaurant.rateCount
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

        // update restaurant
        return await this.restaurantModel.updateOne(
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
          (restaurant.rateValue + reviewDto.rating) /
          (restaurant.rateCount + 1)
        ).toFixed(2);
        const createdReview = new this.reviewModel(reviewDto);
        await createdReview.save();

        // update restaurant
        return await this.restaurantModel.updateOne(
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
