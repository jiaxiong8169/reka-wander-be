import { Injectable } from '@nestjs/common';
import { Body } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { AccommodationDto } from 'src/dto/accommodation.dto';
import { ExceptionMessage } from 'src/exceptions/exception-message.enum';
import {
  Accommodation,
  AccommodationDocument,
} from 'src/schemas/accommodation.schema';
import { SearchQueryDto } from 'src/dto/search-params.dto';
import { processSearchAndFilter } from 'src/utils';
import { SEARCH_FIELDS } from 'src/constants';

@Injectable()
export class AccommodationsService {
  constructor(
    @InjectModel(Accommodation.name)
    private accommodationModel: mongoose.Model<AccommodationDocument>,
  ) {}

  async findOneAccommodationById(
    accommodationId: mongoose.Types.ObjectId | string,
  ): Promise<Accommodation> {
    return this.accommodationModel
      .findOne({
        _id: accommodationId,
      })
      .orFail(new Error(ExceptionMessage.AccommodationNotFound));
  }

  async updateAccommodationById(
    accommodationId: mongoose.Types.ObjectId,
    req: AccommodationDto,
  ): Promise<Accommodation> {
    return this.accommodationModel.findOneAndUpdate(
      { _id: accommodationId },
      req,
      {
        new: true,
        runValidators: true,
      },
    );
  }

  async create(
    @Body() accommodationDto: AccommodationDto,
  ): Promise<Accommodation> {
    const createdAccommodation = new this.accommodationModel(accommodationDto);
    return createdAccommodation.save().catch(() => {
      throw Error(ExceptionMessage.AccommodationExist);
    });
  }

  async deleteOneAccommodationByAccommodationId(
    accommodationId: mongoose.Types.ObjectId,
  ): Promise<Accommodation> {
    return this.accommodationModel
      .findOneAndDelete({ _id: accommodationId })
      .orFail(new Error(ExceptionMessage.CannotDelete));
  }

  async findAllAccommodations(
    params: SearchQueryDto,
  ): Promise<Accommodation[]> {
    // fallback to empty filter if filter is not provided
    // find with empty filter will return all documents
    const { sort, offset, limit, filter = {} } = params;
    const effectiveFilter = processSearchAndFilter(
      filter,
      SEARCH_FIELDS['accommodations'],
    );
    let query = this.accommodationModel.find(effectiveFilter);
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

  async getAccommodationsResultCount(params: SearchQueryDto): Promise<number> {
    const { filter = {} } = params;
    const effectiveFilter = processSearchAndFilter(
      filter,
      SEARCH_FIELDS['accommodations'],
    );
    return this.accommodationModel.find(effectiveFilter).countDocuments();
  }
}
