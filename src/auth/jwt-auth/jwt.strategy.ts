import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt } from 'passport-jwt';
import { Strategy } from 'passport-jwt';
import { Request } from 'express';
import { DecodedJwtPayload, JwtPayload } from 'src/dto/payloads.dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_ACCESS_TOKEN_SECRET,
    });
  }

  async validate(payload: JwtPayload): Promise<DecodedJwtPayload> {
    console.log({ payload });
    const { sub, email, roles, permissions } = payload;
    return { id: sub, email, role: roles[0], permissions };
  }
}
