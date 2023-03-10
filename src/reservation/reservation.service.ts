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
import { SearchAvailabilityQueryDto } from 'src/dto/search-availability.dto';
import { HotelsModule } from 'src/hotels/hotels.module';
import { Vehicle, VehicleDocument } from 'src/schemas/vehicle.schema';
import { Hotel, HotelDocument } from 'src/schemas/hotel.schema';
import { Homestay, HomestayDocument } from 'src/schemas/homestay.schema';
import { Guide, GuideDocument } from 'src/schemas/guide.schema';


@Injectable()
export class ReservationsService {
  constructor(
    @InjectModel(Reservation.name)
    private reservationModel: mongoose.Model<ReservationDocument>,
    @InjectModel(Hotel.name)
    private hotelModel: mongoose.Model<HotelDocument>,
    @InjectModel(Homestay.name)
    private homestayModel: mongoose.Model<HomestayDocument>,
    @InjectModel(Vehicle.name)
    private vehicleModel: mongoose.Model<VehicleDocument>,
    @InjectModel(Guide.name)
    private guideModel: mongoose.Model<GuideDocument>,
  ) { }

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

  async getReservationAvailability(
    reservationId: mongoose.Types.ObjectId | string,
  ): Promise<number> {
    let reservation = await this.reservationModel
      .findOne({
        _id: reservationId,
      }).populate(['targetId', 'userId'])
      .orFail(new Error(ExceptionMessage.ReservationNotFound));
    let id;
    let tempDate = new Date(reservation.startDate).toDateString()
    let startDate = new Date(tempDate);
    let availability = 0;
    let reservedCount = 0;
    if (reservation.type == "Hotel" || reservation.type == "Homestay") {
      id = reservation.roomId;
      availability = reservation.targetId['rooms'].find(element => element.id == id).availability;
      reservedCount = await this.reservationModel.find({ roomId: id, startDate: startDate, status: 'pending' || 'approved' }).countDocuments();
      availability = availability - reservedCount;
    } else if (reservation.type == "Vehicle") {
      id = reservation.targetId;
      availability = reservation.targetId['availability'];
      reservedCount = await this.reservationModel.find({ targetId: id, startDate: startDate, type: 'Vehicle', status: 'pending' || 'approved' }).countDocuments();
      availability = availability - reservedCount;
    } else if (reservation.type == "Guide") {
      id = reservation.packageId;

    }
    console.log(availability);
    return availability;
    // return this.reservationModel.find(effectiveFilter).countDocuments();
  }

  async getAvailabilityAccordingToStartDateEndDate(params: SearchAvailabilityQueryDto): Promise<Reservation[]> {

    let { startDate, endDate, type, id } = params;
    let availability = 0;
    let reservedCount = 0;
    let item, rooms, roomId, packageId, packages;
    let difference = new Date(endDate).getTime() - new Date(startDate).getTime();
    let dayDifference = Math.ceil(difference / (1000 * 3600 * 24));
    let tempDate = new Date(startDate).toDateString()
    let start = new Date(tempDate);
    let minAvailability = [];


    switch (type) {
      case "hotel":
        item = await this.hotelModel
          .findOne({
            _id: id,
          })
          .orFail(new Error(ExceptionMessage.HotelNotFound));
        rooms = item.rooms;
        for (let i = 0; i < rooms.length; i++) {
          start = new Date(tempDate);
          for (let j = 0; j < dayDifference; j++) {
            availability = rooms[i].availability;
            roomId = rooms[i].id.toString();
            console.log(roomId)
            reservedCount = await this.reservationModel.find({ roomId: roomId, startDate: start, status: 'pending' || 'approved' }).countDocuments();
            console.log(reservedCount);
            availability = availability - reservedCount;
            minAvailability.push(availability)
            start.setDate(start.getDate() + 1)
            console.log(minAvailability);
          }
          let min = Math.min(...minAvailability);
          console.log(min)
          rooms[i].availability = min
          console.log(rooms)
          minAvailability = []
        }
        return rooms;
        break;
      case "homestay":
        item = await this.homestayModel
          .findOne({
            _id: id,
          })
          .orFail(new Error(ExceptionMessage.HomestayNotFound));
        rooms = item.rooms;
        for (let i = 0; i < rooms.length; i++) {
          start = new Date(tempDate);
          for (let j = 0; j < dayDifference; j++) {
            availability = rooms[i].availability;
            roomId = rooms[i].id.toString();
            console.log(roomId)
            reservedCount = await this.reservationModel.find({ roomId: roomId, startDate: start, status: 'pending' || 'approved' }).countDocuments();
            console.log(reservedCount);
            availability = availability - reservedCount;
            minAvailability.push(availability)
            start.setDate(start.getDate() + 1)
            console.log(minAvailability);
          }
          let min = Math.min(...minAvailability);
          console.log(min)
          rooms[i].availability = min
          console.log(rooms)
          minAvailability = []
        }
        return rooms;
        break;
      case "vehicle":
        item = await this.vehicleModel
          .findOne({
            _id: id,
          })
          .orFail(new Error(ExceptionMessage.VehicleNotFound));

        start = new Date(tempDate);
        for (let j = 0; j < dayDifference; j++) {
          availability = item.availability;
          console.log(availability)
          reservedCount = await this.reservationModel.find({ vehicleId: item.id, startDate: start, status: 'pending' || 'approved' }).countDocuments();
          console.log(reservedCount);
          availability = availability - reservedCount;
          minAvailability.push(availability)
          start.setDate(start.getDate() + 1)
          console.log(minAvailability);
        }
        let min = Math.min(...minAvailability);
        console.log(min)
        item['availability'] = min;
        console.log(item)
        return item;
        break;
      case "guide":
        item = await this.guideModel
          .findOne({
            _id: id,
          })
          .orFail(new Error(ExceptionMessage.GuideNotFound));
        packages = item.packages;

        for (let i = 0; i < packages.length; i++) {
          start = new Date(tempDate);
          for (let j = 0; j < dayDifference; j++) {
            availability = packages[i].availability;
            // console.log(packages[i].availability)
            packageId = packages[i].id.toString();
            // console.log(packageId)
            reservedCount = await this.reservationModel.find({ packageId: packageId, startDate: start, status: 'pending' || 'approved' }).countDocuments();
            // console.log(reservedCount);
            availability = availability - reservedCount;
            minAvailability.push(availability)
            start.setDate(start.getDate() + 1)
            console.log(minAvailability);
          }
          let min = Math.min(...minAvailability);
          // console.log(min)
          packages[i].availability = min
          // console.log(packages)
          minAvailability = []
        }

        return packages;
        break;
      default:
        break;
    }
    return;
  }

  async deleteAllReservations() {
    // fallback to empty filter if filter is not provided
    // find with empty filter will return all documents

    return this.reservationModel.deleteMany();
  }
}
