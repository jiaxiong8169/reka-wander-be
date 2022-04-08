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
import { GuidesService } from './guides.service';
import * as mongoose from 'mongoose';
import { GuideDto } from 'src/dto/guide.dto';
import { ApiTags } from '@nestjs/swagger';
import { ReviewDto } from 'src/dto/review.dto';
import { User } from 'src/decorators/user.decorator';
import { LikeShareDto } from 'src/dto/like-share.dto';

@ApiTags('guides')
@Controller('guides')
export class GuidesController {
  constructor(private guidesService: GuidesService) {}

  @Post('review')
  @RequirePermissions(Permission.CreateReview)
  async reviewGuide(@Body() req: ReviewDto, @User() reqUser) {
    req.timestamp = new Date();
    req.userId = reqUser && reqUser.id ? reqUser.id : req.userId;
    if (!req.userId || !req.userName)
      throw new BadRequestException('Invalid user information');
    if (!req.contents) throw new BadRequestException('Comment cannot be empty');
    try {
      const guide = await this.guidesService.reviewGuide(req);
      return guide;
    } catch (e: any) {
      throw new BadRequestException(e.message);
    }
  }

  @Post('like')
  @RequirePermissions(Permission.CreateReview)
  async likeGuide(@Body() req: LikeShareDto, @User() reqUser) {
    req.userId = reqUser && reqUser.id ? reqUser.id : req.userId;
    if (!req.userId) throw new BadRequestException('Invalid user information');
    try {
      const guide = await this.guidesService.likeGuide(req);
      return guide;
    } catch (e: any) {
      throw new BadRequestException(e.message);
    }
  }

  @Get()
  @RequirePermissions(Permission.ReadAllGuides)
  async getAllGuides(@Query() query: SearchQueryDto) {
    return {
      data: await this.guidesService.findAllGuides(query),
      total: await this.guidesService.getGuidesResultCount(query),
    };
  }

  @Get(':guideId')
  @RequirePermissions(Permission.ReadGuide)
  async getOneGuideById(@Param('guideId') guideId: mongoose.Types.ObjectId) {
    return this.guidesService.findOneGuideById(guideId).catch((e) => {
      throw new NotFoundException(e.message);
    });
  }

  @Post()
  @RequirePermissions(Permission.CreateGuide)
  async createGuide(@Body() body: GuideDto) {
    try {
      const guide = await this.guidesService.create(body);
      return guide;
    } catch (e: any) {
      throw new BadRequestException(e.message);
    }
  }

  @Delete(':guideId')
  @RequirePermissions(Permission.DeleteGuide)
  async deleteGuide(@Param('guideId') guideId: mongoose.Types.ObjectId) {
    return this.guidesService
      .deleteOneGuideByGuideId(guideId)
      .catch((e: any) => {
        throw new NotFoundException(e.message);
      });
  }

  @Put(':guideId')
  @RequirePermissions(Permission.UpdateGuide)
  async updateGuide(
    @Body() req: GuideDto,
    @Param('guideId') guideId: mongoose.Types.ObjectId,
  ) {
    try {
      const guide = await this.guidesService.updateGuideById(guideId, req);
      return guide;
    } catch (e: any) {
      throw new BadRequestException(e.message);
    }
  }
}
