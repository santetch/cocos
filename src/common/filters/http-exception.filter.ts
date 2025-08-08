import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { Catch, HttpException } from '@nestjs/common';
import type { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const context = host.switchToHttp();

    const response = context.getResponse<Response>();

    const request = context.getRequest<Request>();

    const statusCode = exception.getStatus();

    response.status(statusCode).json({
      statusCode: statusCode,
      message: exception.message,
      timestamp: new Date().toISOString(),
      path: request.url
    });
  }
}
