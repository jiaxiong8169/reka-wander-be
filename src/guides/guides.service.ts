import { Injectable } from '@nestjs/common';
import { Body } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { GuideDto } from 'src/dto/guide.dto';
import { ExceptionMessage } from 'src/exceptions/exception-message.enum';
import { Guide, GuideDocument } from 'src/schemas/guide.schema';
import { SearchQueryDto } from 'src/dto/search-params.dto';
import { processSearchAndFilter } from 'src/utils';
import { SEARCH_FIELDS } from 'src/constants';
import e from 'express';

@Injectable()
export class GuidesService {
  constructor(
    @InjectModel(Guide.name)
    private guideModel: mongoose.Model<GuideDocument>,
  ) {}

  async findOneGuideById(
    guideId: mongoose.Types.ObjectId | string,
  ): Promise<Guide> {
    return this.guideModel
      .findOne({
        _id: guideId,
      })
      .orFail(new Error(ExceptionMessage.GuideNotFound));
  }

  async updateGuideById(
    guideId: mongoose.Types.ObjectId,
    req: GuideDto,
  ): Promise<Guide> {
    return this.guideModel.findOneAndUpdate({ _id: guideId }, req, {
      new: true,
      runValidators: true,
    });
  }

  async create(@Body() guideDto: GuideDto): Promise<Guide> {
    const createdGuide = new this.guideModel(guideDto);
    return createdGuide.save().catch((e) => {
      console.log(e);
      throw Error(ExceptionMessage.GuideExist);
    });
  }

  async deleteOneGuideByGuideId(
    guideId: mongoose.Types.ObjectId,
  ): Promise<Guide> {
    return this.guideModel
      .findOneAndDelete({ _id: guideId })
      .orFail(new Error(ExceptionMessage.CannotDelete));
  }

  async findAllGuides(params: SearchQueryDto): Promise<Guide[]> {
    // fallback to empty filter if filter is not provided
    // find with empty filter will return all documents
    const { sort, offset, limit, filter = {} } = params;
    const effectiveFilter = processSearchAndFilter(
      filter,
      SEARCH_FIELDS['guides'],
    );
    let query = this.guideModel.find(effectiveFilter);
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

  async getGuidesResultCount(params: SearchQueryDto): Promise<number> {
    const { filter = {} } = params;
    const effectiveFilter = processSearchAndFilter(
      filter,
      SEARCH_FIELDS['guides'],
    );
    return this.guideModel.find(effectiveFilter).countDocuments();
  }
}
