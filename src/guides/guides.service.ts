import { BadRequestException, Injectable } from '@nestjs/common';
import { Body } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { GuideDto } from 'src/dto/guide.dto';
import { ExceptionMessage } from 'src/exceptions/exception-message.enum';
import { Guide, GuideDocument } from 'src/schemas/guide.schema';
import { SearchQueryDto } from 'src/dto/search-params.dto';
import { processSearchAndFilter } from 'src/utils';
import { SEARCH_FIELDS } from 'src/constants';
import { Review, ReviewDocument } from 'src/schemas/review.schema';
import { ReviewDto } from 'src/dto/review.dto';
import { LikeShareDto } from 'src/dto/like-share.dto';

@Injectable()
export class GuidesService {
  constructor(
    @InjectModel(Guide.name)
    private guideModel: mongoose.Model<GuideDocument>,
    @InjectModel(Review.name)
    private reviewModel: mongoose.Model<ReviewDocument>,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}

  async findOneGuideById(
    guideId: mongoose.Types.ObjectId | string,
  ): Promise<Guide> {
    return this.guideModel
      .findOne({
        _id: guideId,
      })
      .orFail(new Error(ExceptionMessage.GuideNotFound));
  }

  async updateGuideById(
    guideId: mongoose.Types.ObjectId,
    req: GuideDto,
  ): Promise<Guide> {
    return this.guideModel.findOneAndUpdate({ _id: guideId }, req, {
      new: true,
      runValidators: true,
    });
  }

  async create(@Body() guideDto: GuideDto): Promise<Guide> {
    const createdGuide = new this.guideModel(guideDto);
    return createdGuide.save().catch((e) => {
      console.log(e);
      throw Error(ExceptionMessage.GuideExist);
    });
  }

  async deleteOneGuideByGuideId(
    guideId: mongoose.Types.ObjectId,
  ): Promise<Guide> {
    return this.guideModel
      .findOneAndDelete({ _id: guideId })
      .orFail(new Error(ExceptionMessage.CannotDelete));
  }

  async findAllGuides(params: SearchQueryDto): Promise<Guide[]> {
    // fallback to empty filter if filter is not provided
    // find with empty filter will return all documents
    const { sort, offset, limit, filter = {} } = params;
    const effectiveFilter = processSearchAndFilter(
      filter,
      SEARCH_FIELDS['guides'],
    );
    let query = this.guideModel.find(effectiveFilter);
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

  async getGuidesResultCount(params: SearchQueryDto): Promise<number> {
    const { filter = {} } = params;
    const effectiveFilter = processSearchAndFilter(
      filter,
      SEARCH_FIELDS['guides'],
    );
    return this.guideModel.find(effectiveFilter).countDocuments();
  }

  async reviewGuide(@Body() reviewDto: ReviewDto) {
    const session = await this.connection.startSession();

    await session.withTransaction(async () => {
      // check if guide exists
      const guide = await this.guideModel.findOne({
        _id: reviewDto.targetId,
      });
      if (!guide) {
        throw new BadRequestException('Invalid Guide');
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
          (guide.rateValue + diff) /
          guide.rateCount
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

        // update guide
        await this.guideModel.updateOne(
          { _id: reviewDto.targetId },
          {
            $set: {
              avgRating: newAvgRating,
            },
            $inc: { rateValue: diff },
          },
        );
        return guide;
      } else {
        // if not exists, create review document, rateCount, rateValue, avgRating
        // create review document
        const newAvgRating = (
          (guide.rateValue + reviewDto.rating) /
          (guide.rateCount + 1)
        ).toFixed(2);
        const createdReview = new this.reviewModel(reviewDto);
        await createdReview.save();
        guide.reviews.push(createdReview['_id']);

        // update guide
        await this.guideModel.updateOne(
          { _id: reviewDto.targetId },
          {
            $set: {
              avgRating: newAvgRating,
              reviews: guide.reviews,
            },
            $inc: { rateCount: 1, rateValue: reviewDto.rating },
          },
        );
        return guide;
      }
    });

    session.endSession();
  }

  async likeGuide(@Body() likeShareDto: LikeShareDto) {
    const session = await this.connection.startSession();

    await session.withTransaction(async () => {
      // check if guide exists
      const guide = await this.guideModel.findOne({
        _id: likeShareDto.targetId,
      });
      if (!guide) {
        throw new BadRequestException('Invalid Guide');
      }
      // if already liked, unlike it
      if (guide.likes.includes(likeShareDto.userId)) {
        guide.likes = guide.likes.filter((a) => a != likeShareDto.userId);
      } else {
        guide.likes.push(likeShareDto.userId);
      }
      // update guide
      await this.guideModel.updateOne(
        { _id: likeShareDto.targetId },
        {
          $set: {
            likes: guide.likes,
          },
        },
      );
      return guide;
    });

    session.endSession();
  }
}
