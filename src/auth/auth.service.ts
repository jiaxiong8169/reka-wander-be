import { Injectable } from '@nestjs/common';
import { ExceptionMessage } from 'src/exceptions/exception-message.enum';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import {
  DecodedJwtPayload,
  JwtPayload,
  JwtPayloadResetPasswordToken,
} from 'src/dto/payloads.dto';
import { User } from 'src/schemas/user.schema';
import { CreateUserDto } from 'src/dto/create-user.dto';
import * as mongoose from 'mongoose';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async validateUser(email: string, pass: string): Promise<User> {
    let user;
    try {
      user = await this.usersService.findOneUserByEmail(email);
    } catch (e: any) {
      throw Error(ExceptionMessage.Authentication);
    }

    const isMatch = await bcrypt.compare(pass, user.password);

    if (!isMatch) {
      throw Error(ExceptionMessage.Authentication);
    }

    user.password = undefined;
    return user;
  }

  async validateUserWithoutPassword(email: string): Promise<User> {
    let user;
    try {
      user = await this.usersService.findOneUserByEmail(email);
    } catch (e: any) {
      throw Error(ExceptionMessage.Authentication);
    }
    user.password = undefined;
    return user;
  }

  async login(
    user: User,
  ): Promise<[{ access_token: string; refresh_token: string }, User]> {
    const payload: JwtPayload = {
      sub: user._id.toString(),
      email: user.email,
      roles: [user.role],
      permissions: user.permissions,
    };
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_TOKEN_SECRET,
      expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRATION,
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_TOKEN_SECRET,
      expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRATION,
    });
    await this.usersService.setCurrentRefreshToken(refreshToken, user.email);
    return [
      {
        access_token: accessToken,
        refresh_token: refreshToken,
      },
      user,
    ];
  }

  async refreshSession(
    user: DecodedJwtPayload,
    currentRefreshTokenFromBrowser: string,
  ): Promise<[{ accessToken: string }, User]> {
    const userDoc = await this.usersService.getUserIfRefreshTokenMatches(
      currentRefreshTokenFromBrowser,
      user.email,
    );
    if (!userDoc) {
      throw Error(ExceptionMessage.RefreshTokenTempered);
    }

    // take from `userDoc` rather than `user` because userDoc carries the latest user information
    const payload: JwtPayload = {
      sub: userDoc._id.toString(),
      email: userDoc.email,
      roles: [userDoc.role],
      permissions: userDoc.permissions,
    };
    return [
      {
        accessToken: this.jwtService.sign(payload, {
          secret: process.env.JWT_ACCESS_TOKEN_SECRET,
          expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRATION,
        }),
      },
      userDoc,
    ];
  }

  async register(createUserDto: CreateUserDto): Promise<User> {
    try {
      return await this.usersService.create(createUserDto);
    } catch (e: any) {
      throw Error(e.message);
    }
  }

  async logout(user: User): Promise<User> {
    return this.usersService.clearCurrentRefreshToken(user.email);
  }

  async getResetPasswordToken(email: string): Promise<string> {
    const user = await this.usersService.findOneUserByEmail(email);
    if (!user) {
      throw Error(ExceptionMessage.AccountNotExist);
    }
    const { password } = user;
    const payload: JwtPayloadResetPasswordToken = { email, password };
    return this.jwtService.sign(payload, {
      secret: process.env.JWT_RESET_PASSWORD_TOKEN_SECRET,
      expiresIn: process.env.JWT_RESET_PASSWORD_TOKEN_EXPIRATION,
    });
  }

  async sendResetPasswordEmail(email: string, origin: string): Promise<void> {
    const validPeriodInString = process.env.JWT_RESET_PASSWORD_TOKEN_EXPIRATION;
    // the pattern for the token expiration is `^\d+s?`
    // need to strip the last character to get the number in seconds
    const validPeriod = validPeriodInString.substring(
      0,
      validPeriodInString.length - 1,
    );
    const inMinute = Number(validPeriod) / 60;
    const token = await this.getResetPasswordToken(email);
    this.mailService.sendForgotPasswordMail(
      email,
      `${origin}/auth/resetpassword?token=${token}`,
      inMinute,
    );
  }

  async resetPassword(
    id: mongoose.Types.ObjectId,
    passwordPlainText: string,
  ): Promise<User> {
    return this.usersService.changeUserPassword(id, passwordPlainText);
  }
}
