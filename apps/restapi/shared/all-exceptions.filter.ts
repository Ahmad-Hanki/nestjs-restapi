import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error: any = exception;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      const errorResponse =
        typeof res === 'string' ? { message: res } : (res as any);
      message = errorResponse.message || message;
      error = errorResponse.error || exception.name;
    }

    response.status(status).json({
      message,
      status,
      error,
    });
  }
}
