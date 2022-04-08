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
import { Review, ReviewDocument } from 'src/schemas/review.schema';
import { ReviewDto } from 'src/dto/review.dto';
import { RecommenderFeatures } from 'src/dto/recommender-features.dto';
import { LikeShareDto } from 'src/dto/like-share.dto';

@Injectable()
export class HotelsService {
  constructor(
    @InjectModel(Hotel.name)
    private hotelModel: mongoose.Model<HotelDocument>,
    @InjectModel(Review.name)
    private reviewModel: mongoose.Model<ReviewDocument>,
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

  async reviewHotel(@Body() reviewDto: ReviewDto) {
    const session = await this.connection.startSession();

    await session.withTransaction(async () => {
      // check if hotel exists
      const hotel = await this.hotelModel.findOne({
        _id: reviewDto.targetId,
      });
      if (!hotel) {
        throw new BadRequestException('Invalid Hotel');
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
          (hotel.rateValue + diff) /
          hotel.rateCount
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

        // update hotel
        return await this.hotelModel.updateOne(
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
          (hotel.rateValue + reviewDto.rating) /
          (hotel.rateCount + 1)
        ).toFixed(2);
        const createdReview = new this.reviewModel(reviewDto);
        await createdReview.save();

        // update hotel
        return await this.hotelModel.updateOne(
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

  async likeHotel(@Body() likeShareDto: LikeShareDto) {
    const session = await this.connection.startSession();

    await session.withTransaction(async () => {
      // check if hotel exists
      const hotel = await this.hotelModel.findOne({
        _id: likeShareDto.targetId,
      });
      if (!hotel) {
        throw new BadRequestException('Invalid Hotel');
      }
      // if already liked, unlike it
      if (hotel.likes.includes(likeShareDto.userId)) {
        hotel.likes = hotel.likes.filter((a) => a != likeShareDto.userId);
      } else {
        hotel.likes.push(likeShareDto.userId);
      }
      // update hotel
      await this.hotelModel.updateOne(
        { _id: likeShareDto.targetId },
        {
          $set: {
            likes: hotel.likes,
          },
        },
      );
      return hotel;
    });

    session.endSession();
  }
}
