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
import { User } from 'src/decorators/user.decorator';
import { SearchQueryDto } from 'src/dto/search-params.dto';
import { UsersService } from './users.service';
import * as mongoose from 'mongoose';
import { CreateUserDto } from 'src/dto/create-user.dto';
import { ApiTags } from '@nestjs/swagger';
// import { PermissionsGuard } from 'src/auth/permissions.guard';
// import { JwtAuthGuard } from 'src/auth/jwt-auth/jwt-auth.guard';

@ApiTags('users')
@Controller('users')
// TODO: use guards to implement auth
// @UseGuards(JwtAuthGuard, PermissionsGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @RequirePermissions(Permission.ReadAllUsers)
  //this endpoint only works with the 'new' params in custom-table
  async getAllUsers(@Query() query: SearchQueryDto) {
    // if user is not admin, client must provide the farmId filter
    // non-admin user can only access user in their own farm
    // will check if the user is from that farm
    return {
      data: await this.usersService.findAllUsers(query),
      total: await this.usersService.getUsersResultCount(query),
    };
  }

  @Get('/user')
  @RequirePermissions(Permission.ReadUser)
  async getOneUserByEmail(@Query('email') email: string) {
    return this.usersService.findOneUserByEmail(email).catch((e) => {
      throw new NotFoundException(e.message);
    });
  }

  @Get(':userId')
  @RequirePermissions(Permission.ReadUser)
  async getOneUserById(@Param('userId') userId: mongoose.Types.ObjectId) {
    return this.usersService.findOneUserById(userId).catch((e) => {
      throw new NotFoundException(e.message);
    });
  }

  @Post()
  @RequirePermissions(Permission.CreateUser)
  async createUser(@Body() body: CreateUserDto) {
    try {
      const user = await this.usersService.create(body);
      return user;
    } catch (e: any) {
      throw new BadRequestException(e.message);
    }
  }

  @Delete(':userId')
  @RequirePermissions(Permission.DeleteUser)
  async deleteUser(
    @User() reqUser,
    @Param('userId') userId: mongoose.Types.ObjectId,
  ) {
    return this.usersService
      .deleteOneUserByUserId(userId, reqUser?.id)
      .catch((e: any) => {
        throw new NotFoundException(e.message);
      });
  }

  @Put(':userId')
  @RequirePermissions(Permission.UpdateUser)
  async updateUser(
    @Body() req: CreateUserDto,
    @Param('userId') userId: mongoose.Types.ObjectId,
  ) {
    try {
      const user = await this.usersService.updateUserById(userId, req);
      return user;
    } catch (e: any) {
      throw new BadRequestException(e.message);
    }
  }
}
