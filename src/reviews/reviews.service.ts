import { Injectable } from '@nestjs/common';
import { Body } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { ReviewDto } from 'src/dto/review.dto';
import { ExceptionMessage } from 'src/exceptions/exception-message.enum';
import { Review, ReviewDocument } from 'src/schemas/review.schema';
import { SearchQueryDto } from 'src/dto/search-params.dto';
import { processSearchAndFilter } from 'src/utils';
import { SEARCH_FIELDS } from 'src/constants';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review.name)
    private reviewModel: mongoose.Model<ReviewDocument>,
  ) {}

  async findOneReviewById(
    reviewId: mongoose.Types.ObjectId | string,
  ): Promise<Review> {
    return this.reviewModel
      .findOne({
        _id: reviewId,
      })
      .orFail(new Error(ExceptionMessage.ReviewNotFound));
  }

  async updateReviewById(
    reviewId: mongoose.Types.ObjectId,
    req: ReviewDto,
  ): Promise<Review> {
    return this.reviewModel.findOneAndUpdate({ _id: reviewId }, req, {
      new: true,
      runValidators: true,
    });
  }

  async create(@Body() reviewDto: ReviewDto): Promise<Review> {
    const createdReview = new this.reviewModel(reviewDto);
    return createdReview.save().catch(() => {
      throw Error(ExceptionMessage.ReviewExist);
    });
  }

  async deleteOneReviewByReviewId(
    reviewId: mongoose.Types.ObjectId,
  ): Promise<Review> {
    return this.reviewModel
      .findOneAndDelete({ _id: reviewId })
      .orFail(new Error(ExceptionMessage.CannotDelete));
  }

  async findAllReviews(params: SearchQueryDto): Promise<Review[]> {
    // fallback to empty filter if filter is not provided
    // find with empty filter will return all documents
    const { sort, offset, limit, filter = {} } = params;
    const effectiveFilter = processSearchAndFilter(
      filter,
      SEARCH_FIELDS['reviews'],
    );
    let query = this.reviewModel.find(effectiveFilter);
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

  async getReviewsResultCount(params: SearchQueryDto): Promise<number> {
    const { filter = {} } = params;
    const effectiveFilter = processSearchAndFilter(
      filter,
      SEARCH_FIELDS['reviews'],
    );
    return this.reviewModel.find(effectiveFilter).countDocuments();
  }
}
