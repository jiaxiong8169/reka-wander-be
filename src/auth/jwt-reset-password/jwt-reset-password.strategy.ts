import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { DecodedJwtPayload, JwtPayloadEmailOnly } from 'src/dto/payloads.dto';
import { ExceptionMessage } from 'src/exceptions/exception-message.enum';

@Injectable()
export class JwtResetPasswordStrategy extends PassportStrategy(
  Strategy,
  'jwt-reset-pw',
) {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          let data = request?.query['token'].toString();
          if (!data) return null;
          return data;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_RESET_PASSWORD_TOKEN_SECRET,
    });
  }

  async validate(payload: JwtPayloadEmailOnly): Promise<DecodedJwtPayload> {
    try {
      const { email } = payload;
      const user = await this.usersService.findOneUserByEmail(email);
      if (!user) throw Error(ExceptionMessage.AccountNotExist);
      return {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        permissions: user.permissions,
      };
    } catch (e: any) {
      throw new UnauthorizedException(e.message);
    }
  }
}
