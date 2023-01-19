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
  // UseGuards,
} from '@nestjs/common';
import { Permission } from 'src/auth/permission.enum';
import { RequirePermissions } from 'src/auth/permissions.decorator';
import { SearchQueryDto } from 'src/dto/search-params.dto';
import { AttractionsService } from './attractions.service';
import * as mongoose from 'mongoose';
import { AttractionDto } from 'src/dto/attraction.dto';
import { ApiTags } from '@nestjs/swagger';
import { NearbyParamsDto } from 'src/dto/nearby-params.dto';
import { ReviewDto } from 'src/dto/review.dto';
import { User } from 'src/decorators/user.decorator';
import { LikeShareDto } from 'src/dto/like-share.dto';
// import { JwtAuthGuard } from 'src/auth/jwt-auth/jwt-auth.guard';
// import { PermissionsGuard } from 'src/auth/permissions.guard';

@ApiTags('attractions')
@Controller('attractions')
// @UseGuards(JwtAuthGuard, PermissionsGuard)
export class AttractionsController {
  constructor(private attractionsService: AttractionsService) {}

  @Post('review')
  @RequirePermissions(Permission.CreateReview)
  async reviewAttraction(@Body() req: ReviewDto, @User() reqUser) {
    req.timestamp = new Date();
    req.userId = reqUser && reqUser.id ? reqUser.id : req.userId;
    if (!req.userId || !req.userName)
      throw new BadRequestException('Invalid user information');
    if (!req.contents) throw new BadRequestException('Comment cannot be empty');
    try {
      const attraction = await this.attractionsService.reviewAttraction(req);
      return attraction;
    } catch (e: any) {
      throw new BadRequestException(e.message);
    }
  }

  @Post('like')
  @RequirePermissions(Permission.CreateReview)
  async likeAttraction(@Body() req: LikeShareDto, @User() reqUser) {
    req.userId = reqUser && reqUser.id ? reqUser.id : req.userId;
    if (!req.userId) throw new BadRequestException('Invalid user information');
    try {
      const attraction = await this.attractionsService.likeAttraction(req);
      return attraction;
    } catch (e: any) {
      throw new BadRequestException(e.message);
    }
  }

  @Post('share')
  @RequirePermissions(Permission.CreateReview)
  async shareAttraction(@Body() req: LikeShareDto, @User() reqUser) {
    req.userId = reqUser && reqUser.id ? reqUser.id : req.userId;
    if (!req.userId) throw new BadRequestException('Invalid user information');
    try {
      const attraction = await this.attractionsService.shareAttraction(req);
      return attraction;
    } catch (e: any) {
      throw new BadRequestException(e.message);
    }
  }

  @Get('nearby')
  @RequirePermissions(Permission.ReadAllAttractions)
  async getNearbyAttractions(@Query() query: NearbyParamsDto) {
    const nearbyAttractions =
      await this.attractionsService.findNearbyAttractions(query);
    return {
      data: nearbyAttractions,
      total: nearbyAttractions.length,
    };
  }

  @Get()
  @RequirePermissions(Permission.ReadAllAttractions)
  async getAllAttractions(@Query() query: SearchQueryDto) {
    return {
      data: await this.attractionsService.findAllAttractions(query),
      total: await this.attractionsService.getAttractionsResultCount(query),
    };
  }

  @Get(':attractionId')
  @RequirePermissions(Permission.ReadAttraction)
  async getOneAttractionById(
    @Param('attractionId') attractionId: mongoose.Types.ObjectId,
  ) {
    return this.attractionsService
      .findOneAttractionById(attractionId)
      .catch((e) => {
        throw new NotFoundException(e.message);
      });
  }

  @Post()
  @RequirePermissions(Permission.CreateAttraction)
  async createAttraction(@Body() body: AttractionDto) {
    try {
      body.timestamp = new Date();
      const attraction = await this.attractionsService.create(body);
      body.timestamp = new Date();
      return attraction;
    } catch (e: any) {
      throw new BadRequestException(e.message);
    }
  }

  @Delete(':attractionId')
  @RequirePermissions(Permission.DeleteAttraction)
  async deleteAttraction(
    @Param('attractionId') attractionId: mongoose.Types.ObjectId,
  ) {
    return this.attractionsService
      .deleteOneAttractionByAttractionId(attractionId)
      .catch((e: any) => {
        throw new NotFoundException(e.message);
      });
  }

  @Put(':attractionId')
  @RequirePermissions(Permission.UpdateAttraction)
  async updateAttraction(
    @Body() req: AttractionDto,
    @Param('attractionId') attractionId: mongoose.Types.ObjectId,
  ) {
    try {
      const attraction = await this.attractionsService.updateAttractionById(
        attractionId,
        req,
      );
      return attraction;
    } catch (e: any) {
      throw new BadRequestException(e.message);
    }
  }
}
