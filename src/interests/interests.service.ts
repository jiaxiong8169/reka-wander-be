import { Injectable } from '@nestjs/common';
import { Body } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { InterestDto } from 'src/dto/interest.dto';
import { ExceptionMessage } from 'src/exceptions/exception-message.enum';
import { Interest, InterestDocument } from 'src/schemas/interest.schema';
import { SearchQueryDto } from 'src/dto/search-params.dto';
import { processSearchAndFilter } from 'src/utils';
import { SEARCH_FIELDS } from 'src/constants';

@Injectable()
export class InterestsService {
  constructor(
    @InjectModel(Interest.name)
    private interestModel: mongoose.Model<InterestDocument>,
  ) {}

  async findOneInterestById(
    interestId: mongoose.Types.ObjectId | string,
  ): Promise<Interest> {
    return this.interestModel
      .findOne({
        _id: interestId,
      })
      .orFail(new Error(ExceptionMessage.InterestNotFound));
  }

  async updateInterestById(
    interestId: mongoose.Types.ObjectId,
    req: InterestDto,
  ): Promise<Interest> {
    return this.interestModel.findOneAndUpdate({ _id: interestId }, req, {
      new: true,
      runValidators: true,
    });
  }

  async create(@Body() interestDto: InterestDto): Promise<Interest> {
    const createdInterest = new this.interestModel(interestDto);
    return createdInterest.save().catch(() => {
      throw Error(ExceptionMessage.InterestExist);
    });
  }

  async deleteOneInterestByInterestId(
    interestId: mongoose.Types.ObjectId,
  ): Promise<Interest> {
    return this.interestModel
      .findOneAndDelete({ _id: interestId })
      .orFail(new Error(ExceptionMessage.CannotDelete));
  }

  async findAllInterests(params: SearchQueryDto): Promise<Interest[]> {
    // fallback to empty filter if filter is not provided
    // find with empty filter will return all documents
    const { sort, offset, limit, filter = {} } = params;
    const effectiveFilter = processSearchAndFilter(
      filter,
      SEARCH_FIELDS['interests'],
    );
    let query = this.interestModel.find(effectiveFilter);
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

  async getInterestsResultCount(params: SearchQueryDto): Promise<number> {
    const { filter = {} } = params;
    const effectiveFilter = processSearchAndFilter(
      filter,
      SEARCH_FIELDS['interests'],
    );
    return this.interestModel.find(effectiveFilter).countDocuments();
  }
}
