import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { DecodedJwtPayload, JwtPayload } from 'src/dto/payloads.dto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refresh_token'),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_REFRESH_TOKEN_SECRET,
    });
  }

  async validate(payload: JwtPayload): Promise<DecodedJwtPayload> {
    try {
      console.log(payload);
      const { sub, email, roles, permissions } = payload;
      await this.usersService.findOneUserByEmail(email);
      return { id: sub, email, role: roles[0], permissions };
    } catch (e: any) {
      throw new UnauthorizedException(e.message);
    }
  }
}
