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
import { HotelsService } from './hotels.service';
import * as mongoose from 'mongoose';
import { HotelDto } from 'src/dto/hotel.dto';
import { ApiTags } from '@nestjs/swagger';
import { NearbyParamsDto } from 'src/dto/nearby-params.dto';
import { RateDto } from 'src/dto/rate.dto';
import { User } from 'src/decorators/user.decorator';

@ApiTags('hotels')
@Controller('hotels')
export class HotelsController {
  constructor(private hotelsService: HotelsService) {}

  @Post('rate')
  @RequirePermissions(Permission.CreateRate)
  async rateHotel(@Body() req: RateDto, @User() reqUser) {
    req.timestamp = new Date();
    req.userId = reqUser && reqUser.id ? reqUser.id : req.userId;
    // request must be associated with user ID
    if (!req.userId) throw new BadRequestException('Invalid User ID');
    try {
      const hotel = await this.hotelsService.rateHotel(req);
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