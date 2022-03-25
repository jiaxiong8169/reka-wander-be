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
import { VictualsService } from './victuals.service';
import * as mongoose from 'mongoose';
import { VictualDto } from 'src/dto/victual.dto';

@Controller('victuals')
export class VictualsController {
  constructor(private victualsService: VictualsService) {}

  @Get()
  @RequirePermissions(Permission.ReadAllVictuals)
  async getAllVictuals(@Query() query: SearchQueryDto) {
    return {
      data: await this.victualsService.findAllVictuals(query),
      total: await this.victualsService.getVictualsResultCount(query),
    };
  }

  @Get(':victualId')
  @RequirePermissions(Permission.ReadVictual)
  async getOneVictualById(
    @Param('victualId') victualId: mongoose.Types.ObjectId,
  ) {
    return this.victualsService.findOneVictualById(victualId).catch((e) => {
      throw new NotFoundException(e.message);
    });
  }

  @Post()
  @RequirePermissions(Permission.CreateVictual)
  async createVictual(@Body() body: VictualDto) {
    try {
      const victual = await this.victualsService.create(body);
      return victual;
    } catch (e: any) {
      throw new BadRequestException(e.message);
    }
  }

  @Delete(':victualId')
  @RequirePermissions(Permission.DeleteVictual)
  async deleteVictual(@Param('victualId') victualId: mongoose.Types.ObjectId) {
    return this.victualsService
      .deleteOneVictualByVictualId(victualId)
      .catch((e: any) => {
        throw new NotFoundException(e.message);
      });
  }

  @Put(':victualId')
  @RequirePermissions(Permission.UpdateVictual)
  async updateVictual(
    @Body() req: VictualDto,
    @Param('victualId') victualId: mongoose.Types.ObjectId,
  ) {
    try {
      const victual = await this.victualsService.updateVictualById(
        victualId,
        req,
      );
      return victual;
    } catch (e: any) {
      throw new BadRequestException(e.message);
    }
  }
}
