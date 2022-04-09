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
import { VehiclesService } from './vehicles.service';
import * as mongoose from 'mongoose';
import { VehicleDto } from 'src/dto/vehicle.dto';
import { ApiTags } from '@nestjs/swagger';
import { NearbyParamsDto } from 'src/dto/nearby-params.dto';

@ApiTags('vehicles')
@Controller('vehicles')
export class VehiclesController {
  constructor(private vehiclesService: VehiclesService) {}

  @Get('nearby')
  @RequirePermissions(Permission.ReadAllVehicles)
  async getNearbyVehicles(@Query() query: NearbyParamsDto) {
    const nearbyVehicles = await this.vehiclesService.findNearbyVehicles(query);
    return {
      data: nearbyVehicles,
      total: nearbyVehicles.length,
    };
  }

  @Get()
  @RequirePermissions(Permission.ReadAllVehicles)
  async getAllVehicles(@Query() query: SearchQueryDto) {
    return {
      data: await this.vehiclesService.findAllVehicles(query),
      total: await this.vehiclesService.getVehiclesResultCount(query),
    };
  }

  @Get(':vehicleId')
  @RequirePermissions(Permission.ReadVehicle)
  async getOneVehicleById(
    @Param('vehicleId') vehicleId: mongoose.Types.ObjectId,
  ) {
    return this.vehiclesService.findOneVehicleById(vehicleId).catch((e) => {
      throw new NotFoundException(e.message);
    });
  }

  @Post()
  @RequirePermissions(Permission.CreateVehicle)
  async createVehicle(@Body() body: VehicleDto) {
    try {
      const vehicle = await this.vehiclesService.create(body);
      return vehicle;
    } catch (e: any) {
      throw new BadRequestException(e.message);
    }
  }

  @Delete(':vehicleId')
  @RequirePermissions(Permission.DeleteVehicle)
  async deleteVehicle(@Param('vehicleId') vehicleId: mongoose.Types.ObjectId) {
    return this.vehiclesService
      .deleteOneVehicleByVehicleId(vehicleId)
      .catch((e: any) => {
        throw new NotFoundException(e.message);
      });
  }

  @Put(':vehicleId')
  @RequirePermissions(Permission.UpdateVehicle)
  async updateVehicle(
    @Body() req: VehicleDto,
    @Param('vehicleId') vehicleId: mongoose.Types.ObjectId,
  ) {
    try {
      const vehicle = await this.vehiclesService.updateVehicleById(
        vehicleId,
        req,
      );
      return vehicle;
    } catch (e: any) {
      throw new BadRequestException(e.message);
    }
  }
}
