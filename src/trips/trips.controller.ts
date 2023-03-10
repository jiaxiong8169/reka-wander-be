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
import { TripsService } from './trips.service';
import * as mongoose from 'mongoose';
import { TripDto } from 'src/dto/trip.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('trips')
@Controller('trips')
export class TripsController {
  constructor(private tripsService: TripsService) {}

  // recommend now will not attempt to create a trip
  @Post('recommend')
  @RequirePermissions(Permission.CreateTrip)
  async getTripRecommendations(@Body() body: TripDto) {
    try {
      // set endDate if not exists yet
      if (!body.endDate) body.endDate = body.startDate;
      // assign timestamp to current timestamp
      body.timestamp = new Date();
      body.days =
        (new Date(body.endDate).getTime() -
          new Date(body.startDate).getTime()) /
          (1000 * 3600 * 24) +
        1;
      body.mealHours = body.days * 6;
      body.visitHours = body.days * 5;
      body.estimatedBudget =
        body.accommodationBudget +
        body.attractionBudget +
        body.restaurantBudget +
        body.vehicleBudget;
      const trip = await this.tripsService.getTripRecommendations(body);
      return trip;
    } catch (e: any) {
      console.log(e);
      throw new BadRequestException(e.message);
    }
  }

  @Get()
  @RequirePermissions(Permission.ReadAllTrips)
  async getAllTrips(@Query() query: SearchQueryDto) {
    return {
      data: await this.tripsService.findAllTrips(query),
      total: await this.tripsService.getTripsResultCount(query),
    };
  }

  @Get(':tripId')
  @RequirePermissions(Permission.ReadTrip)
  async getOneTripById(@Param('tripId') tripId: mongoose.Types.ObjectId) {
    return this.tripsService.findOneTripById(tripId).catch((e) => {
      throw new NotFoundException(e.message);
    });
  }

  @Post()
  @RequirePermissions(Permission.CreateTrip)
  async createTrip(@Body() body: TripDto) {
    try {
      // assign timestamp to current timestamp
      body.timestamp = new Date();
      const trip = await this.tripsService.create(body);
      return trip;
    } catch (e: any) {
      throw new BadRequestException(e.message);
    }
  }

  @Delete(':tripId')
  @RequirePermissions(Permission.DeleteTrip)
  async deleteTrip(@Param('tripId') tripId: mongoose.Types.ObjectId) {
    return this.tripsService.deleteOneTripByTripId(tripId).catch((e: any) => {
      throw new NotFoundException(e.message);
    });
  }

  @Put(':tripId')
  @RequirePermissions(Permission.UpdateTrip)
  async updateTrip(
    @Body() req: TripDto,
    @Param('tripId') tripId: mongoose.Types.ObjectId,
  ) {
    try {
      const trip = await this.tripsService.updateTripById(tripId, req);
      return trip;
    } catch (e: any) {
      throw new BadRequestException(e.message);
    }
  }
}
