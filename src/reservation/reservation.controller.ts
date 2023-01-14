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
import { ReservationsService } from './reservation.service';
import * as mongoose from 'mongoose';
import { ReservationDto } from 'src/dto/reservation.dto';
import { ApiTags } from '@nestjs/swagger';
import { SearchAvailabilityQueryDto } from 'src/dto/search-availability.dto';

@ApiTags('reservations')
@Controller('reservations')
export class ReservationsController {
  constructor(private reservationsService: ReservationsService) { }

  @Get()
  @RequirePermissions(Permission.ReadAllReservations)
  async getAllReservations(@Query() query: SearchQueryDto) {
    return {
      data: await this.reservationsService.findAllReservations(query),
      total: await this.reservationsService.getReservationsResultCount(query),
    };
  }

  @Get('availability')
  @RequirePermissions(Permission.ReadAllReservations)
  async getAvailabilityAccordingToStartDateEndDate(@Query() query: SearchAvailabilityQueryDto) {
    return await this.reservationsService.getAvailabilityAccordingToStartDateEndDate(query)
      ;
  }

  @Get(':reservationId')
  @RequirePermissions(Permission.ReadReservation)
  async getOneReservationById(
    @Param('reservationId') reservationId: mongoose.Types.ObjectId,
  ) {
    return {
      data: await this.reservationsService
        .findOneReservationById(reservationId)
        .catch((e) => {
          throw new NotFoundException(e.message);
        }), total: await this.reservationsService.getReservationAvailability(reservationId)
    };
  }

  @Post()
  @RequirePermissions(Permission.CreateReservation)
  async createReservation(@Body() body: ReservationDto) {
    try {
      // assign timestamp to current timestamp
      body.timestamp = new Date();
      let difference = new Date(body.endDate).getTime() - new Date(body.startDate).getTime();
      let dayDifference = Math.ceil(difference / (1000 * 3600 * 24));
      let tempDate = new Date(body.startDate).toDateString()
      let startDate = new Date(tempDate);
      let endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 1)
      let reservation;
      let arr = [];
      for (let i = 0; i < dayDifference; i++) {
        body.startDate = startDate
        body.endDate = endDate
        reservation = await this.reservationsService.create(body);
        arr.push(reservation)
        startDate.setDate(startDate.getDate() + 1)
        endDate.setDate(endDate.getDate() + 1)
      }
      return arr;
    } catch (e: any) {
      throw new BadRequestException(e.message);
    }
  }

  @Delete(':reservationId')
  @RequirePermissions(Permission.DeleteReservation)
  async deleteReservation(
    @Param('reservationId') reservationId: mongoose.Types.ObjectId,
  ) {
    return this.reservationsService
      .deleteOneReservationByReservationId(reservationId)
      .catch((e: any) => {
        throw new NotFoundException(e.message);
      });
  }

  @Put(':reservationId')
  @RequirePermissions(Permission.UpdateReservation)
  async updateReservation(
    @Body() req: ReservationDto,
    @Param('reservationId') reservationId: mongoose.Types.ObjectId,
  ) {
    try {
      const reservation = await this.reservationsService.updateReservationById(
        reservationId,
        req,
      );
      return reservation;
    } catch (e: any) {
      throw new BadRequestException(e.message);
    }
  }

  @Delete()
  @RequirePermissions(Permission.DeleteReservation)
  async deleteAllReservation(
  ) {
    return this.reservationsService
      .deleteAllReservations()
      .catch((e: any) => {
        throw new NotFoundException(e.message);
      });
  }


}
