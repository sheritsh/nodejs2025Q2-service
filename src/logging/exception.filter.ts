import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { LoggingService } from './logging.service';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly loggingService: LoggingService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let message: string;
    let error: string;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object') {
        message = (exceptionResponse as any).message || 'An error occurred';
        error = (exceptionResponse as any).error || exception.constructor.name;
      } else {
        message = exceptionResponse as string;
        error = exception.constructor.name;
      }
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal Server Error';
      error = 'Internal Server Error';
    }

    const errorMessage = `${request.method} ${request.url} - ${status} - ${message}`;
    const stackTrace =
      exception instanceof Error ? exception.stack : String(exception);

    this.loggingService.error(errorMessage, stackTrace, 'ExceptionFilter');

    response.status(status).json({
      statusCode: status,
      message,
      error,
    });
  }
}
