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
import { LikeShareDto } from 'src/dto/like-share.dto';
import { TripDto } from 'src/dto/trip.dto';

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

  async findAttractionsByFeatures(trip: TripDto): Promise<Attraction[]> {
    let query = this.attractionModel.find({
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
    query = query.sort('price -avgRating');

    const attractions = await query.exec();

    attractions.sort((attraction1, attraction2) => {
      if (trip.interests.includes(attraction1.interest.toString())) return -1;
      return 1;
    });

    return attractions;
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
    const { long, lat, distance, sort, offset, limit } = params;
    // find nearby with nearSphere
    let query = this.attractionModel.find({
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
        await this.attractionModel.updateOne(
          { _id: reviewDto.targetId },
          {
            $set: {
              avgRating: newAvgRating,
            },
            $inc: { rateValue: diff },
          },
        );
        return attraction;
      } else {
        // if not exists, create review document, rateCount, rateValue, avgRating
        // create review document
        const newAvgRating = (
          (attraction.rateValue + reviewDto.rating) /
          (attraction.rateCount + 1)
        ).toFixed(2);
        const createdReview = new this.reviewModel(reviewDto);
        await createdReview.save();
        attraction.reviews.push(createdReview['_id']);

        // update attraction
        await this.attractionModel.updateOne(
          { _id: reviewDto.targetId },
          {
            $set: {
              avgRating: newAvgRating,
              reviews: attraction.reviews,
            },
            $inc: { rateCount: 1, rateValue: reviewDto.rating },
          },
        );
        return attraction;
      }
    });

    session.endSession();
  }

  async likeAttraction(@Body() likeShareDto: LikeShareDto) {
    const session = await this.connection.startSession();

    await session.withTransaction(async () => {
      // check if attraction exists
      const attraction = await this.attractionModel.findOne({
        _id: likeShareDto.targetId,
      });
      if (!attraction) {
        throw new BadRequestException('Invalid Attraction');
      }
      // if already liked, unlike it
      if (attraction.likes.includes(likeShareDto.userId)) {
        attraction.likes = attraction.likes.filter(
          (a) => a != likeShareDto.userId,
        );
      } else {
        attraction.likes.push(likeShareDto.userId);
      }
      // update attraction
      await this.attractionModel.updateOne(
        { _id: likeShareDto.targetId },
        {
          $set: {
            likes: attraction.likes,
          },
        },
      );
      return attraction;
    });

    session.endSession();
  }

  async shareAttraction(@Body() likeShareDto: LikeShareDto) {
    const session = await this.connection.startSession();

    await session.withTransaction(async () => {
      // check if attraction exists
      const attraction = await this.attractionModel.findOne({
        _id: likeShareDto.targetId,
      });
      if (!attraction) {
        throw new BadRequestException('Invalid Attraction');
      }
      // add into share list if does not exist
      if (!attraction.shares.includes(likeShareDto.userId)) {
        attraction.shares.push(likeShareDto.userId);
        // update attraction
        await this.attractionModel.updateOne(
          { _id: likeShareDto.targetId },
          {
            $set: {
              shares: attraction.shares,
            },
          },
        );
        return attraction;
      }
    });

    session.endSession();
  }
}
