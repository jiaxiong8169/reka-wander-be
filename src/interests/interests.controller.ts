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
import { InterestsService } from './interests.service';
import * as mongoose from 'mongoose';
import { InterestDto } from 'src/dto/interest.dto';

@Controller('interests')
export class InterestsController {
  constructor(private interestsService: InterestsService) {}

  @Get()
  @RequirePermissions(Permission.ReadAllInterests)
  async getAllInterests(@Query() query: SearchQueryDto) {
    return {
      data: await this.interestsService.findAllInterests(query),
      total: await this.interestsService.getInterestsResultCount(query),
    };
  }

  @Get(':interestId')
  @RequirePermissions(Permission.ReadInterest)
  async getOneInterestById(
    @Param('interestId') interestId: mongoose.Types.ObjectId,
  ) {
    return this.interestsService.findOneInterestById(interestId).catch((e) => {
      throw new NotFoundException(e.message);
    });
  }

  @Post()
  @RequirePermissions(Permission.CreateInterest)
  async createInterest(@Body() body: InterestDto) {
    try {
      const interest = await this.interestsService.create(body);
      return interest;
    } catch (e: any) {
      throw new BadRequestException(e.message);
    }
  }

  @Delete(':interestId')
  @RequirePermissions(Permission.DeleteInterest)
  async deleteInterest(
    @Param('interestId') interestId: mongoose.Types.ObjectId,
  ) {
    return this.interestsService
      .deleteOneInterestByInterestId(interestId)
      .catch((e: any) => {
        throw new NotFoundException(e.message);
      });
  }

  @Put(':interestId')
  @RequirePermissions(Permission.UpdateInterest)
  async updateInterest(
    @Body() req: InterestDto,
    @Param('interestId') interestId: mongoose.Types.ObjectId,
  ) {
    try {
      const interest = await this.interestsService.updateInterestById(
        interestId,
        req,
      );
      return interest;
    } catch (e: any) {
      throw new BadRequestException(e.message);
    }
  }
}
