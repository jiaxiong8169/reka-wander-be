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
import { AccommodationsService } from './accommodations.service';
import * as mongoose from 'mongoose';
import { AccommodationDto } from 'src/dto/accommodation.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('accommodations')
@Controller('accommodations')
export class AccommodationsController {
  constructor(private accommodationsService: AccommodationsService) {}

  @Get()
  @RequirePermissions(Permission.ReadAllAccommodations)
  async getAllAccommodations(@Query() query: SearchQueryDto) {
    return {
      data: await this.accommodationsService.findAllAccommodations(query),
      total: await this.accommodationsService.getAccommodationsResultCount(
        query,
      ),
    };
  }

  @Get(':accommodationId')
  @RequirePermissions(Permission.ReadAccommodation)
  async getOneAccommodationById(
    @Param('accommodationId') accommodationId: mongoose.Types.ObjectId,
  ) {
    return this.accommodationsService
      .findOneAccommodationById(accommodationId)
      .catch((e) => {
        throw new NotFoundException(e.message);
      });
  }

  @Post()
  @RequirePermissions(Permission.CreateAccommodation)
  async createAccommodation(@Body() body: AccommodationDto) {
    try {
      const accommodation = await this.accommodationsService.create(body);
      return accommodation;
    } catch (e: any) {
      throw new BadRequestException(e.message);
    }
  }

  @Delete(':accommodationId')
  @RequirePermissions(Permission.DeleteAccommodation)
  async deleteAccommodation(
    @Param('accommodationId') accommodationId: mongoose.Types.ObjectId,
  ) {
    return this.accommodationsService
      .deleteOneAccommodationByAccommodationId(accommodationId)
      .catch((e: any) => {
        throw new NotFoundException(e.message);
      });
  }

  @Put(':accommodationId')
  @RequirePermissions(Permission.UpdateAccommodation)
  async updateAccommodation(
    @Body() req: AccommodationDto,
    @Param('accommodationId') accommodationId: mongoose.Types.ObjectId,
  ) {
    try {
      const accommodation =
        await this.accommodationsService.updateAccommodationById(
          accommodationId,
          req,
        );
      return accommodation;
    } catch (e: any) {
      throw new BadRequestException(e.message);
    }
  }
}
