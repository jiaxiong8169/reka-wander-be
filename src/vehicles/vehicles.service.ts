import { Injectable } from '@nestjs/common';
import { Body } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { VehicleDto } from 'src/dto/vehicle.dto';
import { ExceptionMessage } from 'src/exceptions/exception-message.enum';
import { Vehicle, VehicleDocument } from 'src/schemas/vehicle.schema';
import { SearchQueryDto } from 'src/dto/search-params.dto';
import { processSearchAndFilter } from 'src/utils';
import { SEARCH_FIELDS } from 'src/constants';
import { NearbyParamsDto } from 'src/dto/nearby-params.dto';
import { TripDto } from 'src/dto/trip.dto';

@Injectable()
export class VehiclesService {
  constructor(
    @InjectModel(Vehicle.name)
    private vehicleModel: mongoose.Model<VehicleDocument>,
  ) {}

  async findOneVehicleById(
    vehicleId: mongoose.Types.ObjectId | string,
  ): Promise<Vehicle> {
    return this.vehicleModel
      .findOne({
        _id: vehicleId,
      })
      .orFail(new Error(ExceptionMessage.VehicleNotFound));
  }

  async updateVehicleById(
    vehicleId: mongoose.Types.ObjectId,
    req: VehicleDto,
  ): Promise<Vehicle> {
    return this.vehicleModel.findOneAndUpdate({ _id: vehicleId }, req, {
      new: true,
      runValidators: true,
    });
  }

  async create(@Body() vehicleDto: VehicleDto): Promise<Vehicle> {
    const createdVehicle = new this.vehicleModel(vehicleDto);
    return createdVehicle.save().catch(() => {
      throw Error(ExceptionMessage.VehicleExist);
    });
  }

  async deleteOneVehicleByVehicleId(
    vehicleId: mongoose.Types.ObjectId,
  ): Promise<Vehicle> {
    return this.vehicleModel
      .findOneAndDelete({ _id: vehicleId })
      .orFail(new Error(ExceptionMessage.CannotDelete));
  }

  async findAllVehicles(params: SearchQueryDto): Promise<Vehicle[]> {
    // fallback to empty filter if filter is not provided
    // find with empty filter will return all documents
    const { sort, offset, limit, filter = {} } = params;
    const effectiveFilter = processSearchAndFilter(
      filter,
      SEARCH_FIELDS['vehicles'],
    );
    let query = this.vehicleModel.find(effectiveFilter);
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

  async getVehiclesResultCount(params: SearchQueryDto): Promise<number> {
    const { filter = {} } = params;
    const effectiveFilter = processSearchAndFilter(
      filter,
      SEARCH_FIELDS['vehicles'],
    );
    return this.vehicleModel.find(effectiveFilter).countDocuments();
  }

  async findNearbyVehicles(params: NearbyParamsDto): Promise<Vehicle[]> {
    const { long, lat, distance, sort, offset, limit } = params;
    // find nearby with nearSphere
    let query = this.vehicleModel.find({
      loc: {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: [long, lat],
          },
          $minDistance: 0, // minimum 0 meters
          $maxDistance: distance ? distance : 5000, // default 5000 meters
        },
      },
    });
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

  async findVehicleByFeatures(trip: TripDto) {
    if (!trip.rentCar) return;
    const targetPrice = trip.kids ? 'priceWithBaby' : 'price';
    let query = this.vehicleModel.find({
      loc: {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: [trip.long, trip.lat],
          },
          $minDistance: 0, // minimum 0 meters
          $maxDistance: 300000, // default 300 kilometers
        },
      },
      pax: {
        $gte: trip.pax,
      },
      availability: {
        $gt: 0,
      },
      [targetPrice]: {
        $lte: trip.budget,
      },
    });
    query = query.sort('price');

    const vehicles = await query.exec();

    if (vehicles.length > 0) {
      trip.vehicles = [vehicles[0]['_id']];
      trip.vehicleObjects = [vehicles[0]];
      trip.kids
        ? (trip.budget -= vehicles[0].priceWithBaby)
        : (trip.budget -= vehicles[0].price);
    }
  }
}
