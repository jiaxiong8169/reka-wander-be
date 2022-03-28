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
  // UseGuards,
} from '@nestjs/common';
import { Permission } from 'src/auth/permission.enum';
import { RequirePermissions } from 'src/auth/permissions.decorator';
import { SearchQueryDto } from 'src/dto/search-params.dto';
import { AttractionsService } from './attractions.service';
import * as mongoose from 'mongoose';
import { AttractionDto } from 'src/dto/attraction.dto';
import { ApiTags } from '@nestjs/swagger';
import { NearbyParamsDto } from 'src/dto/nearby-params.dto';
import { RateDto } from 'src/dto/rate.dto';
import { User } from 'src/decorators/user.decorator';
// import { JwtAuthGuard } from 'src/auth/jwt-auth/jwt-auth.guard';
// import { PermissionsGuard } from 'src/auth/permissions.guard';

@ApiTags('attractions')
@Controller('attractions')
// @UseGuards(JwtAuthGuard, PermissionsGuard)
export class AttractionsController {
  constructor(private attractionsService: AttractionsService) {}

  @Post('rate')
  @RequirePermissions(Permission.CreateRate)
  async rateAttraction(@Body() req: RateDto, @User() reqUser) {
    req.timestamp = new Date();
    req.userId = reqUser && reqUser.id ? reqUser.id : req.userId;
    // request must be associated with user ID
    if (!req.userId) throw new BadRequestException('Invalid User ID');
    try {
      const attraction = await this.attractionsService.rateAttraction(req);
      return attraction;
    } catch (e: any) {
      throw new BadRequestException(e.message);
    }
  }

  @Get('nearby')
  @RequirePermissions(Permission.ReadAllAttractions)
  async getNearbyAttractions(@Query() query: NearbyParamsDto) {
    const nearbyAttractions =
      await this.attractionsService.findNearbyAttractions(query);
    return {
      data: nearbyAttractions,
      total: nearbyAttractions.length,
    };
  }

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
