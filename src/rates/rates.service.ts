import { Injectable } from '@nestjs/common';
import { Body } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { RateDto } from 'src/dto/rate.dto';
import { ExceptionMessage } from 'src/exceptions/exception-message.enum';
import { Rate, RateDocument } from 'src/schemas/rate.schema';
import { SearchQueryDto } from 'src/dto/search-params.dto';
import { processSearchAndFilter } from 'src/utils';
import { SEARCH_FIELDS } from 'src/constants';

@Injectable()
export class RatesService {
  constructor(
    @InjectModel(Rate.name)
    private rateModel: mongoose.Model<RateDocument>,
  ) {}

  async findOneRateById(
    rateId: mongoose.Types.ObjectId | string,
  ): Promise<Rate> {
    return this.rateModel
      .findOne({
        _id: rateId,
      })
      .orFail(new Error(ExceptionMessage.RateNotFound));
  }

  async updateRateById(
    rateId: mongoose.Types.ObjectId,
    req: RateDto,
  ): Promise<Rate> {
    return this.rateModel.findOneAndUpdate({ _id: rateId }, req, {
      new: true,
      runValidators: true,
    });
  }

  async create(@Body() rateDto: RateDto): Promise<Rate> {
    const createdRate = new this.rateModel(rateDto);
    return createdRate.save().catch(() => {
      throw Error(ExceptionMessage.RateExist);
    });
  }

  async deleteOneRateByRateId(rateId: mongoose.Types.ObjectId): Promise<Rate> {
    return this.rateModel
      .findOneAndDelete({ _id: rateId })
      .orFail(new Error(ExceptionMessage.CannotDelete));
  }

  async findAllRates(params: SearchQueryDto): Promise<Rate[]> {
    // fallback to empty filter if filter is not provided
    // find with empty filter will return all documents
    const { sort, offset, limit, filter = {} } = params;
    const effectiveFilter = processSearchAndFilter(
      filter,
      SEARCH_FIELDS['rates'],
    );
    let query = this.rateModel.find(effectiveFilter);
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

  async getRatesResultCount(params: SearchQueryDto): Promise<number> {
    const { filter = {} } = params;
    const effectiveFilter = processSearchAndFilter(
      filter,
      SEARCH_FIELDS['rates'],
    );
    return this.rateModel.find(effectiveFilter).countDocuments();
  }
}
