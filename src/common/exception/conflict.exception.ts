import { HttpException } from '@nestjs/common';

export class JwtExpiredException extends HttpException {
  constructor() {
    super('conflict data', 409);
  }
}
