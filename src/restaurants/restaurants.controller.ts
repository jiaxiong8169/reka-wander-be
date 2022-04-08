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
import { RestaurantsService } from './restaurants.service';
import * as mongoose from 'mongoose';
import { RestaurantDto } from 'src/dto/restaurant.dto';
import { ApiTags } from '@nestjs/swagger';
import { NearbyParamsDto } from 'src/dto/nearby-params.dto';
import { ReviewDto } from 'src/dto/review.dto';
import { User } from 'src/decorators/user.decorator';

@ApiTags('restaurants')
@Controller('restaurants')
export class RestaurantsController {
  constructor(private restaurantsService: RestaurantsService) {}

  @Post('review')
  @RequirePermissions(Permission.CreateReview)
  async reviewRestaurant(@Body() req: ReviewDto, @User() reqUser) {
    req.timestamp = new Date();
    req.userId = reqUser && reqUser.id ? reqUser.id : req.userId;
    if (!req.userId || !req.userName)
      throw new BadRequestException('Invalid user information');
    if (!req.contents) throw new BadRequestException('Comment cannot be empty');
    try {
      const restaurant = await this.restaurantsService.reviewRestaurant(req);
      return restaurant;
    } catch (e: any) {
      throw new BadRequestException(e.message);
    }
  }

  @Get('nearby')
  @RequirePermissions(Permission.ReadAllRestaurants)
  async getNearbyRestaurants(@Query() query: NearbyParamsDto) {
    const nearbyRestaurants =
      await this.restaurantsService.findNearbyRestaurants(query);
    return {
      data: nearbyRestaurants,
      total: nearbyRestaurants.length,
    };
  }

  @Get()
  @RequirePermissions(Permission.ReadAllRestaurants)
  async getAllRestaurants(@Query() query: SearchQueryDto) {
    return {
      data: await this.restaurantsService.findAllRestaurants(query),
      total: await this.restaurantsService.getRestaurantsResultCount(query),
    };
  }

  @Get(':restaurantId')
  @RequirePermissions(Permission.ReadRestaurant)
  async getOneRestaurantById(
    @Param('restaurantId') restaurantId: mongoose.Types.ObjectId,
  ) {
    return this.restaurantsService
      .findOneRestaurantById(restaurantId)
      .catch((e) => {
        throw new NotFoundException(e.message);
      });
  }

  @Post()
  @RequirePermissions(Permission.CreateRestaurant)
  async createRestaurant(@Body() body: RestaurantDto) {
    try {
      const restaurant = await this.restaurantsService.create(body);
      return restaurant;
    } catch (e: any) {
      throw new BadRequestException(e.message);
    }
  }

  @Delete(':restaurantId')
  @RequirePermissions(Permission.DeleteRestaurant)
  async deleteRestaurant(
    @Param('restaurantId') restaurantId: mongoose.Types.ObjectId,
  ) {
    return this.restaurantsService
      .deleteOneRestaurantByRestaurantId(restaurantId)
      .catch((e: any) => {
        throw new NotFoundException(e.message);
      });
  }

  @Put(':restaurantId')
  @RequirePermissions(Permission.UpdateRestaurant)
  async updateRestaurant(
    @Body() req: RestaurantDto,
    @Param('restaurantId') restaurantId: mongoose.Types.ObjectId,
  ) {
    try {
      const restaurant = await this.restaurantsService.updateRestaurantById(
        restaurantId,
        req,
      );
      return restaurant;
    } catch (e: any) {
      throw new BadRequestException(e.message);
    }
  }
}
