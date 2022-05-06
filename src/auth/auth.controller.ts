import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Post,
  Put,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDto } from 'src/dto/create-user.dto';
import { AuthService } from './auth.service';
import JwtRefreshGuard from './jwt-refresh/jwt-refresh.guard';
import { LocalAuthGuard } from './local-auth/local-auth.guard';
import { Response } from 'express';
import { JwtAuthGuard } from './jwt-auth/jwt-auth.guard';
import { JwtResetPasswordGuard } from './jwt-reset-password/jwt-reset-password.guard';
import { User as UserSchema } from 'src/schemas/user.schema';
import { DecodedJwtPayload } from 'src/dto/payloads.dto';
import * as mongoose from 'mongoose';
import { User } from 'src/decorators/user.decorator';
import { ApiTags } from '@nestjs/swagger';
import { FirebaseAuthGuard } from './firebase-auth/firebase-auth.guard';
import { MailService } from 'src/mail/mail.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private mailService: MailService,
  ) {}

  @Post('login')
  @UseGuards(LocalAuthGuard)
  async login(@Req() req, @Res({ passthrough: true }) response: Response) {
    const reqUser: UserSchema = req.user;
    const [tokens, user] = await this.authService.login(reqUser);
    return { tokens, user };
  }

  @Post('login/google')
  @UseGuards(FirebaseAuthGuard)
  async loginWithGoogle(
    @Req() req,
    @Res({ passthrough: true }) response: Response,
  ) {
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

  @Post('resetpassword')
  @UseGuards(JwtResetPasswordGuard)
  async resetPassword(@Req() req, @Body('password') password) {
    const reqUser: DecodedJwtPayload = req.user;
    const reqUserId = new mongoose.Types.ObjectId(reqUser.id);
    return this.authService.resetPassword(reqUserId, password);
  }

  @Get('requestresetpassword')
  async requestResetPasswordToken(@Query('email') email: string) {
    try {
      return await this.authService.sendResetPasswordEmail(
        email,
        'http://localhost:9000',
      );
    } catch (e) {
      throw new NotFoundException(e.message);
    }
  }
}
