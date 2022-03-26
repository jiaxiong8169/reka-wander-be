import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Put,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDto } from 'src/dto/create-user.dto';
import { AuthService } from './auth.service';
import JwtRefreshGuard from './jwt-refresh/jwt-refresh.guard';
import { LocalAuthGuard } from './local-auth/local-auth.guard';
import { Response } from 'express';
import { Roles } from './roles';
import { RequirePermissions } from './permissions.decorator';
import { PermissionsGuard } from './permissions.guard';
import { JwtAuthGuard } from './jwt-auth/jwt-auth.guard';
import { JwtResetPasswordGuard } from './jwt-reset-password/jwt-reset-password.guard';
import { User as UserSchema } from 'src/schemas/user.schema';
import { DecodedJwtPayload } from 'src/dto/payloads.dto';
import * as mongoose from 'mongoose';
import { User } from 'src/decorators/user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @UseGuards(LocalAuthGuard)
  async login(@Req() req, @Res({ passthrough: true }) response: Response) {
    const reqUser: UserSchema = req.user;
    const [tokens, user] = await this.authService.login(reqUser);
    return { tokens, user };
  }

  @Post('refresh')
  @UseGuards(JwtRefreshGuard)
  async refresh(@User() user, @Body() req: { refresh_token: string }) {
    const reqUser: DecodedJwtPayload = user;
    const currentRefreshTokenFromBrowser = req.refresh_token;
    console.log(currentRefreshTokenFromBrowser);
    try {
      const [refreshedAccessToken, user] =
        await this.authService.refreshSession(
          reqUser,
          currentRefreshTokenFromBrowser,
        );
      return { access_token: refreshedAccessToken.accessToken };
    } catch (e: any) {
      throw new UnauthorizedException(e.message);
    }
  }

  @Post('register')
  @RequirePermissions(...Roles.admin)
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  async register(@Body() req: CreateUserDto) {
    try {
      return this.authService.register(req);
    } catch (e: any) {
      throw new BadRequestException(e.message);
    }
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Req() req, @Res({ passthrough: true }) response: Response) {
    const user = await this.authService.logout(req.user);
    return user;
  }

  @Put('resetpassword')
  @UseGuards(JwtResetPasswordGuard)
  async resetPassword(@Req() req, @Body('password') password) {
    const reqUser: DecodedJwtPayload = req.user;
    const reqUserId = new mongoose.Types.ObjectId(reqUser.id);
    return this.authService.resetPassword(reqUserId, password);
  }

  @Get('requestresetpassword')
  @UseGuards(JwtAuthGuard)
  async requestResetPasswordToken(@Query('email') email: string) {
    const validPeriodInString = process.env.JWT_RESET_PASSWORD_TOKEN_EXPIRATION;
    // the pattern for the token expiration is `^\d+s?`
    // need to strip the last character to get the number in seconds
    const validPeriod = validPeriodInString.substring(
      0,
      validPeriodInString.length - 1,
    );
    const inMinute = Number(validPeriod) / 60;
    const token = await this.authService.getResetPasswordToken(email);
    return {
      url: `${
        process.env.REACT_APP_FRONTEND_URL +
        process.env.RESET_PASSWORD_ROUTE_PATH
      }?token=${token}`,
      expiration: `${inMinute} minute${inMinute > 1 ? 's' : ''}`,
    };
  }
}
