import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { PUBLIC_KEY } from '../decorator/public.decorator';
import {
  InvalidTokenException,
  JwtExpiredException,
} from '../exception/jwt.exception';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }
  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }
    return super.canActivate(context);
  }

  handleRequest(err, user, info: Error) {
    try {
      if (err || info || !user) {
        throw err || info || new UnauthorizedException();
      }
      return user;
    } catch (error) {
      if (error.message === 'jwt expired') {
        throw new JwtExpiredException();
      } else {
        throw new InvalidTokenException();
      }
    }
  }
}
