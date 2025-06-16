import { Module, Global } from '@nestjs/common';
import { LoggingService } from './logging.service';
import { GlobalExceptionFilter } from './exception.filter';
import { LoggingMiddleware } from './logging.middleware';

@Global()
@Module({
  providers: [LoggingService, GlobalExceptionFilter, LoggingMiddleware],
  exports: [LoggingService, GlobalExceptionFilter, LoggingMiddleware],
})
export class LoggingModule {}
