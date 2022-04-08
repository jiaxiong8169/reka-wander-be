import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { Permission } from 'src/auth/permission.enum';
import { RequirePermissions } from 'src/auth/permissions.decorator';
import { SearchQueryDto } from 'src/dto/search-params.dto';
import { ReviewsService } from './reviews.service';
import * as mongoose from 'mongoose';
import { ReviewDto } from 'src/dto/review.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @Get()
  @RequirePermissions(Permission.ReadAllReviews)
  async getAllReviews(@Query() query: SearchQueryDto) {
    return {
      data: await this.reviewsService.findAllReviews(query),
      total: await this.reviewsService.getReviewsResultCount(query),
    };
  }

  @Get(':reviewId')
  @RequirePermissions(Permission.ReadReview)
  async getOneReviewById(@Param('reviewId') reviewId: mongoose.Types.ObjectId) {
    return this.reviewsService.findOneReviewById(reviewId).catch((e) => {
      throw new NotFoundException(e.message);
    });
  }

  @Post()
  @RequirePermissions(Permission.CreateReview)
  async createReview(@Body() body: ReviewDto) {
    try {
      // assign timestamp to current timestamp
      body.timestamp = new Date();
      const review = await this.reviewsService.create(body);
      return review;
    } catch (e: any) {
      throw new BadRequestException(e.message);
    }
  }

  @Delete(':reviewId')
  @RequirePermissions(Permission.DeleteReview)
  async deleteReview(@Param('reviewId') reviewId: mongoose.Types.ObjectId) {
    return this.reviewsService
      .deleteOneReviewByReviewId(reviewId)
      .catch((e: any) => {
        throw new NotFoundException(e.message);
      });
  }

  @Put(':reviewId')
  @RequirePermissions(Permission.UpdateReview)
  async updateReview(
    @Body() req: ReviewDto,
    @Param('reviewId') reviewId: mongoose.Types.ObjectId,
  ) {
    try {
      const review = await this.reviewsService.updateReviewById(reviewId, req);
      return review;
    } catch (e: any) {
      throw new BadRequestException(e.message);
    }
  }
}
