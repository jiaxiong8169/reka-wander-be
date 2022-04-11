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
  UseGuards,
} from '@nestjs/common';
import { Permission } from 'src/auth/permission.enum';
import { RequirePermissions } from 'src/auth/permissions.decorator';
import { SearchQueryDto } from 'src/dto/search-params.dto';
import { HotelsService } from './hotels.service';
import * as mongoose from 'mongoose';
import { HotelDto } from 'src/dto/hotel.dto';
import { ApiTags } from '@nestjs/swagger';
import { NearbyParamsDto } from 'src/dto/nearby-params.dto';
import { ReviewDto } from 'src/dto/review.dto';
import { User } from 'src/decorators/user.decorator';
import { LikeShareDto } from 'src/dto/like-share.dto';
import { PermissionsGuard } from 'src/auth/permissions.guard';
import { JwtAuthGuard } from 'src/auth/jwt-auth/jwt-auth.guard';

@ApiTags('hotels')
@Controller('hotels')
export class HotelsController {
  constructor(private hotelsService: HotelsService) {}

  @Post('review')
  @RequirePermissions(Permission.CreateReview)
  async reviewHotel(@Body() req: ReviewDto, @User() reqUser) {
    req.timestamp = new Date();
    req.userId = reqUser && reqUser.id ? reqUser.id : req.userId;
    if (!req.userId || !req.userName)
      throw new BadRequestException('Invalid user information');
    if (!req.contents) throw new BadRequestException('Comment cannot be empty');
    try {
      const hotel = await this.hotelsService.reviewHotel(req);
      return hotel;
    } catch (e: any) {
      throw new BadRequestException(e.message);
    }
  }

  @Post('like')
  @RequirePermissions(Permission.CreateReview)
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  async likeHotel(@Body() req: LikeShareDto, @User() reqUser) {
    console.log('hello');
    req.userId = reqUser && reqUser.id ? reqUser.id : req.userId;
    if (!req.userId) throw new BadRequestException('Invalid user information');
    try {
      const hotel = await this.hotelsService.likeHotel(req);
      return hotel;
    } catch (e: any) {
      throw new BadRequestException(e.message);
    }
  }

  @Post('share')
  @RequirePermissions(Permission.CreateReview)
  async shareHotel(@Body() req: LikeShareDto, @User() reqUser) {
    req.userId = reqUser && reqUser.id ? reqUser.id : req.userId;
    if (!req.userId) throw new BadRequestException('Invalid user information');
    try {
      const hotel = await this.hotelsService.shareHotel(req);
      return hotel;
    } catch (e: any) {
      throw new BadRequestException(e.message);
    }
  }

  @Get('nearby')
  @RequirePermissions(Permission.ReadAllHotels)
  async getNearbyHotels(@Query() query: NearbyParamsDto) {
    const nearbyHotels = await this.hotelsService.findNearbyHotels(query);
    return {
      data: nearbyHotels,
      total: nearbyHotels.length,
    };
  }

  @Get()
  @RequirePermissions(Permission.ReadAllHotels)
  async getAllHotels(@Query() query: SearchQueryDto) {
    return {
      data: await this.hotelsService.findAllHotels(query),
      total: await this.hotelsService.getHotelsResultCount(query),
    };
  }

  @Get(':hotelId')
  @RequirePermissions(Permission.ReadHotel)
  async getOneHotelById(@Param('hotelId') hotelId: mongoose.Types.ObjectId) {
    return this.hotelsService.findOneHotelById(hotelId).catch((e) => {
      throw new NotFoundException(e.message);
    });
  }

  @Post()
  @RequirePermissions(Permission.CreateHotel)
  async createHotel(@Body() body: HotelDto) {
    try {
      const hotel = await this.hotelsService.create(body);
      return hotel;
    } catch (e: any) {
      throw new BadRequestException(e.message);
    }
  }

  @Delete(':hotelId')
  @RequirePermissions(Permission.DeleteHotel)
  async deleteHotel(@Param('hotelId') hotelId: mongoose.Types.ObjectId) {
    return this.hotelsService
      .deleteOneHotelByHotelId(hotelId)
      .catch((e: any) => {
        throw new NotFoundException(e.message);
      });
  }

  @Put(':hotelId')
  @RequirePermissions(Permission.UpdateHotel)
  async updateHotel(
    @Body() req: HotelDto,
    @Param('hotelId') hotelId: mongoose.Types.ObjectId,
  ) {
    try {
      const hotel = await this.hotelsService.updateHotelById(hotelId, req);
      return hotel;
    } catch (e: any) {
      throw new BadRequestException(e.message);
    }
  }
}
