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
import { GuidesService } from './guides.service';
import * as mongoose from 'mongoose';
import { GuideDto } from 'src/dto/guide.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('guides')
@Controller('guides')
export class GuidesController {
  constructor(private guidesService: GuidesService) {}

  @Get()
  @RequirePermissions(Permission.ReadAllGuides)
  async getAllGuides(@Query() query: SearchQueryDto) {
    return {
      data: await this.guidesService.findAllGuides(query),
      total: await this.guidesService.getGuidesResultCount(query),
    };
  }

  @Get(':guideId')
  @RequirePermissions(Permission.ReadGuide)
  async getOneGuideById(@Param('guideId') guideId: mongoose.Types.ObjectId) {
    return this.guidesService.findOneGuideById(guideId).catch((e) => {
      throw new NotFoundException(e.message);
    });
  }

  @Post()
  @RequirePermissions(Permission.CreateGuide)
  async createGuide(@Body() body: GuideDto) {
    try {
      const guide = await this.guidesService.create(body);
      return guide;
    } catch (e: any) {
      throw new BadRequestException(e.message);
    }
  }

  @Delete(':guideId')
  @RequirePermissions(Permission.DeleteGuide)
  async deleteGuide(@Param('guideId') guideId: mongoose.Types.ObjectId) {
    return this.guidesService
      .deleteOneGuideByGuideId(guideId)
      .catch((e: any) => {
        throw new NotFoundException(e.message);
      });
  }

  @Put(':guideId')
  @RequirePermissions(Permission.UpdateGuide)
  async updateGuide(
    @Body() req: GuideDto,
    @Param('guideId') guideId: mongoose.Types.ObjectId,
  ) {
    try {
      const guide = await this.guidesService.updateGuideById(guideId, req);
      return guide;
    } catch (e: any) {
      throw new BadRequestException(e.message);
    }
  }
}
