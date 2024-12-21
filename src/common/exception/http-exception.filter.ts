import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private logger = new Logger();

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { ip, method, originalUrl: url } = request;
    const status = exception.getStatus();

    this.logger.error(
      `[${method}] ${url} ${ip} ` + exception.message,
      exception.stack,
    );

    return response.status(status).json({
      code: status,
      message: exception.getResponse()['message'] || exception.message,
      data: null,
    });
  }
}
