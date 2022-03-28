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
import { AttractionsService } from './attractions.service';
import * as mongoose from 'mongoose';
import { AttractionDto } from 'src/dto/attraction.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('attractions')
@Controller('attractions')
export class AttractionsController {
  constructor(private attractionsService: AttractionsService) {}

  @Get()
  @RequirePermissions(Permission.ReadAllAttractions)
  async getAllAttractions(@Query() query: SearchQueryDto) {
    return {
      data: await this.attractionsService.findAllAttractions(query),
      total: await this.attractionsService.getAttractionsResultCount(query),
    };
  }

  @Get(':attractionId')
  @RequirePermissions(Permission.ReadAttraction)
  async getOneAttractionById(
    @Param('attractionId') attractionId: mongoose.Types.ObjectId,
  ) {
    return this.attractionsService
      .findOneAttractionById(attractionId)
      .catch((e) => {
        throw new NotFoundException(e.message);
      });
  }

  @Post()
  @RequirePermissions(Permission.CreateAttraction)
  async createAttraction(@Body() body: AttractionDto) {
    try {
      const attraction = await this.attractionsService.create(body);
      return attraction;
    } catch (e: any) {
      throw new BadRequestException(e.message);
    }
  }

  @Delete(':attractionId')
  @RequirePermissions(Permission.DeleteAttraction)
  async deleteAttraction(
    @Param('attractionId') attractionId: mongoose.Types.ObjectId,
  ) {
    return this.attractionsService
      .deleteOneAttractionByAttractionId(attractionId)
      .catch((e: any) => {
        throw new NotFoundException(e.message);
      });
  }

  @Put(':attractionId')
  @RequirePermissions(Permission.UpdateAttraction)
  async updateAttraction(
    @Body() req: AttractionDto,
    @Param('attractionId') attractionId: mongoose.Types.ObjectId,
  ) {
    try {
      const attraction = await this.attractionsService.updateAttractionById(
        attractionId,
        req,
      );
      return attraction;
    } catch (e: any) {
      throw new BadRequestException(e.message);
    }
  }
}
