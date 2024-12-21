import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../interface/jwtPayload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request.headers.authorization?.split('Bearer ')[1];
        },
      ]),

      secretOrKey: process.env.JWT_SECRET,
    });
  }

  // jwt payload를 이용해 유저 정보를 가져옴 , accessToken payload
  async validate(payload: JwtPayload) {
    // 만료된 토큰 예외처리

    return {
      userId: payload.userId,
      name: payload.name,
    };
  }
}
