import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { JwtAuthGuard } from './auth/jwt-auth/jwt-auth.guard';
import { Permission } from './auth/permission.enum';
import { RequirePermissions } from './auth/permissions.decorator';
import { PermissionsGuard } from './auth/permissions.guard';
import { User } from './decorators/user.decorator';
import { DecodedJwtPayload } from './dto/payloads.dto';
import { User as UserSchema } from './schemas/user.schema';
import { UsersService } from './users/users.service';

@Controller()
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AppController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @RequirePermissions(Permission.ReadProfile)
  getProfile(@User() user: DecodedJwtPayload): Promise<UserSchema> {
    const { id } = user;
    return this.usersService.findOneUserById(id);
  }
}
