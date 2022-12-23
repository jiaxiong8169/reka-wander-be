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

@ApiTags('reservations')
@Controller('reservations')
export class ReservationsController {
  constructor(private reservationsService: ReservationsService) {}

  @Get()
  @RequirePermissions(Permission.ReadAllReservations)
  async getAllReservations(@Query() query: SearchQueryDto) {
    return {
      data: await this.reservationsService.findAllReservations(query),
      total: await this.reservationsService.getReservationsResultCount(query),
    };
  }

  @Get(':reservationId')
  @RequirePermissions(Permission.ReadReservation)
  async getOneReservationById(
    @Param('reservationId') reservationId: mongoose.Types.ObjectId,
  ) {
    return this.reservationsService
      .findOneReservationById(reservationId)
      .catch((e) => {
        throw new NotFoundException(e.message);
      });
  }

  @Post()
  @RequirePermissions(Permission.CreateReservation)
  async createReservation(@Body() body: ReservationDto) {
    try {
      // assign timestamp to current timestamp
      // body.timestamp = new Date();
      const reservation = await this.reservationsService.create(body);
      return reservation;
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
}
