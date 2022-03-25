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
import { RatesService } from './rates.service';
import * as mongoose from 'mongoose';
import { RateDto } from 'src/dto/rate.dto';

@Controller('rates')
export class RatesController {
  constructor(private ratesService: RatesService) {}

  @Get()
  @RequirePermissions(Permission.ReadAllRates)
  async getAllRates(@Query() query: SearchQueryDto) {
    return {
      data: await this.ratesService.findAllRates(query),
      total: await this.ratesService.getRatesResultCount(query),
    };
  }

  @Get(':rateId')
  @RequirePermissions(Permission.ReadRate)
  async getOneRateById(@Param('rateId') rateId: mongoose.Types.ObjectId) {
    return this.ratesService.findOneRateById(rateId).catch((e) => {
      throw new NotFoundException(e.message);
    });
  }

  @Post()
  @RequirePermissions(Permission.CreateRate)
  async createRate(@Body() body: RateDto) {
    try {
      // assign timestamp to current timestamp
      body.timestamp = new Date();
      const rate = await this.ratesService.create(body);
      return rate;
    } catch (e: any) {
      throw new BadRequestException(e.message);
    }
  }

  @Delete(':rateId')
  @RequirePermissions(Permission.DeleteRate)
  async deleteRate(@Param('rateId') rateId: mongoose.Types.ObjectId) {
    return this.ratesService.deleteOneRateByRateId(rateId).catch((e: any) => {
      throw new NotFoundException(e.message);
    });
  }

  @Put(':rateId')
  @RequirePermissions(Permission.UpdateRate)
  async updateRate(
    @Body() req: RateDto,
    @Param('rateId') rateId: mongoose.Types.ObjectId,
  ) {
    try {
      const rate = await this.ratesService.updateRateById(rateId, req);
      return rate;
    } catch (e: any) {
      throw new BadRequestException(e.message);
    }
  }
}
