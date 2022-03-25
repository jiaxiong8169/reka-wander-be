import { Injectable } from '@nestjs/common';
import { Body } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { VictualDto } from 'src/dto/victual.dto';
import { ExceptionMessage } from 'src/exceptions/exception-message.enum';
import { Victual, VictualDocument } from 'src/schemas/victual.schema';
import { SearchQueryDto } from 'src/dto/search-params.dto';
import { processSearchAndFilter } from 'src/utils';
import { SEARCH_FIELDS } from 'src/constants';

@Injectable()
export class VictualsService {
  constructor(
    @InjectModel(Victual.name)
    private victualModel: mongoose.Model<VictualDocument>,
  ) {}

  async findOneVictualById(
    victualId: mongoose.Types.ObjectId | string,
  ): Promise<Victual> {
    return this.victualModel
      .findOne({
        _id: victualId,
      })
      .orFail(new Error(ExceptionMessage.VictualNotFound));
  }

  async updateVictualById(
    victualId: mongoose.Types.ObjectId,
    req: VictualDto,
  ): Promise<Victual> {
    return this.victualModel.findOneAndUpdate({ _id: victualId }, req, {
      new: true,
      runValidators: true,
    });
  }

  async create(@Body() victualDto: VictualDto): Promise<Victual> {
    const createdVictual = new this.victualModel(victualDto);
    return createdVictual.save().catch(() => {
      throw Error(ExceptionMessage.VictualExist);
    });
  }

  async deleteOneVictualByVictualId(
    victualId: mongoose.Types.ObjectId,
  ): Promise<Victual> {
    return this.victualModel
      .findOneAndDelete({ _id: victualId })
      .orFail(new Error(ExceptionMessage.CannotDelete));
  }

  async findAllVictuals(params: SearchQueryDto): Promise<Victual[]> {
    // fallback to empty filter if filter is not provided
    // find with empty filter will return all documents
    const { sort, offset, limit, filter = {} } = params;
    const effectiveFilter = processSearchAndFilter(
      filter,
      SEARCH_FIELDS['victuals'],
    );
    let query = this.victualModel.find(effectiveFilter);
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

  async getVictualsResultCount(params: SearchQueryDto): Promise<number> {
    const { filter = {} } = params;
    const effectiveFilter = processSearchAndFilter(
      filter,
      SEARCH_FIELDS['victuals'],
    );
    return this.victualModel.find(effectiveFilter).countDocuments();
  }
}
