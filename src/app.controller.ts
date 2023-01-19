import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from './auth/jwt-auth/jwt-auth.guard';
import { Permission } from './auth/permission.enum';
import { RequirePermissions } from './auth/permissions.decorator';
import { PermissionsGuard } from './auth/permissions.guard';
import { User } from './decorators/user.decorator';
import { DecodedJwtPayload } from './dto/payloads.dto';
import { User as UserSchema } from './schemas/user.schema';
import { UsersService } from './users/users.service';

@ApiTags('profile')
@Controller()
export class AppController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @RequirePermissions(Permission.ReadProfile)
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  getProfile(@User() user: DecodedJwtPayload): Promise<UserSchema> {
    const { id } = user;
    return this.usersService.findOneUserById(id);
  }

  @Get('')
  async tempEndpoint(@Req() req) {
    console.log(req);
  }
}
