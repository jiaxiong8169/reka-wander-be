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
import { HomestaysService } from './homestays.service';
import * as mongoose from 'mongoose';
import { HomestayDto } from 'src/dto/homestay.dto';
import { ApiTags } from '@nestjs/swagger';
import { NearbyParamsDto } from 'src/dto/nearby-params.dto';

@ApiTags('homestays')
@Controller('homestays')
export class HomestaysController {
  constructor(private homestaysService: HomestaysService) {}

  @Get('nearby')
  @RequirePermissions(Permission.ReadAllHomestays)
  async getNearbyHomestays(@Query() query: NearbyParamsDto) {
    const nearbyHomestays = await this.homestaysService.findNearbyHomestays(
      query,
    );
    return {
      data: nearbyHomestays,
      total: nearbyHomestays.length,
    };
  }

  @Get()
  @RequirePermissions(Permission.ReadAllHomestays)
  async getAllHomestays(@Query() query: SearchQueryDto) {
    return {
      data: await this.homestaysService.findAllHomestays(query),
      total: await this.homestaysService.getHomestaysResultCount(query),
    };
  }

  @Get(':homestayId')
  @RequirePermissions(Permission.ReadHomestay)
  async getOneHomestayById(
    @Param('homestayId') homestayId: mongoose.Types.ObjectId,
  ) {
    return this.homestaysService.findOneHomestayById(homestayId).catch((e) => {
      throw new NotFoundException(e.message);
    });
  }

  @Post()
  @RequirePermissions(Permission.CreateHomestay)
  async createHomestay(@Body() body: HomestayDto) {
    try {
      const homestay = await this.homestaysService.create(body);
      return homestay;
    } catch (e: any) {
      throw new BadRequestException(e.message);
    }
  }

  @Delete(':homestayId')
  @RequirePermissions(Permission.DeleteHomestay)
  async deleteHomestay(
    @Param('homestayId') homestayId: mongoose.Types.ObjectId,
  ) {
    return this.homestaysService
      .deleteOneHomestayByHomestayId(homestayId)
      .catch((e: any) => {
        throw new NotFoundException(e.message);
      });
  }

  @Put(':homestayId')
  @RequirePermissions(Permission.UpdateHomestay)
  async updateHomestay(
    @Body() req: HomestayDto,
    @Param('homestayId') homestayId: mongoose.Types.ObjectId,
  ) {
    try {
      const homestay = await this.homestaysService.updateHomestayById(
        homestayId,
        req,
      );
      return homestay;
    } catch (e: any) {
      throw new BadRequestException(e.message);
    }
  }
}
