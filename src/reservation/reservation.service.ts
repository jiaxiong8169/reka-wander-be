import { Injectable } from '@nestjs/common';
import { Body } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { ReservationDto } from 'src/dto/reservation.dto';
import { ExceptionMessage } from 'src/exceptions/exception-message.enum';
import {
  Reservation,
  ReservationDocument,
} from 'src/schemas/reservation.schema';
import { SearchQueryDto } from 'src/dto/search-params.dto';
import { processSearchAndFilter } from 'src/utils';
import { SEARCH_FIELDS } from 'src/constants';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectModel(Reservation.name)
    private reservationModel: mongoose.Model<ReservationDocument>,
  ) {}

  async findOneReservationById(
    reservationId: mongoose.Types.ObjectId | string,
  ): Promise<Reservation> {
    return this.reservationModel
      .findOne({
        _id: reservationId,
      }).populate(['targetId', 'userId'])
      .orFail(new Error(ExceptionMessage.ReservationNotFound));
  }

  async updateReservationById(
    reservationId: mongoose.Types.ObjectId,
    req: ReservationDto,
  ): Promise<Reservation> {
    return this.reservationModel.findOneAndUpdate({ _id: reservationId }, req, {
      new: true,
      runValidators: true,
    });
  }

  async create(@Body() reservationDto: ReservationDto): Promise<Reservation> {
    const createdReservation = new this.reservationModel(reservationDto);
    return createdReservation.save().catch((e) => {
      console.log(e);
      throw Error(ExceptionMessage.ReservationExist);
    });
  }

  async deleteOneReservationByReservationId(
    reservationId: mongoose.Types.ObjectId,
  ): Promise<Reservation> {
    return this.reservationModel
      .findOneAndDelete({ _id: reservationId })
      .orFail(new Error(ExceptionMessage.CannotDelete));
  }

  async findAllReservations(params: SearchQueryDto): Promise<Reservation[]> {
    // fallback to empty filter if filter is not provided
    // find with empty filter will return all documents
    const { sort, offset, limit, filter = {} } = params;
    const effectiveFilter = processSearchAndFilter(
      filter,
      SEARCH_FIELDS['reservations'],
    );
    let query = this.reservationModel.find(effectiveFilter).populate(['targetId', 'userId']);
    if (sort) {
      query = query.sort(sort);
    }
    if (offset) {
      query = query.skip(offset);
    }
    if (limit) {
      query.limit(limit);
    }

    return query.exec();
  }

  async getReservationsResultCount(params: SearchQueryDto): Promise<number> {
    const { filter = {} } = params;
    const effectiveFilter = processSearchAndFilter(
      filter,
      SEARCH_FIELDS['reservations'],
    );
    return this.reservationModel.find(effectiveFilter).countDocuments();
  }
}
