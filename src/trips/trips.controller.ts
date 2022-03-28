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
