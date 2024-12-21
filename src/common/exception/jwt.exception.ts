import { HttpException } from '@nestjs/common';

/**
 * @description 토큰 만료 에러
 */
export class JwtExpiredException extends HttpException {
  constructor() {
    super('jwt expired', 499);
  }
}

/**
 * @description 토큰이 유효하지 않을 때 발생하는 에러
 */
export class InvalidTokenException extends HttpException {
  constructor() {
    super('invalid token', 498);
  }
}

/**
 * @description 토큰 타입이 일치하지 않을 때 발생하는 에러
 */
export class InvalidTokenTypeException extends HttpException {
  constructor() {
    super('invalid token type', 497);
  }
}
