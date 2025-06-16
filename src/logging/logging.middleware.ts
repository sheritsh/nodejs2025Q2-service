import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { LoggingService } from './logging.service';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  constructor(private readonly loggingService: LoggingService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const startTime = Date.now();
    const { method, url, query, body } = req;

    this.loggingService.logRequest(method, url, query, body);

    const originalSend = res.send;
    res.send = function (data) {
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      const loggingService = (req as any).loggingService;
      if (loggingService) {
        loggingService.logResponse(method, url, res.statusCode, responseTime);
      }

      return originalSend.call(this, data);
    };

    (req as any).loggingService = this.loggingService;

    res.on('finish', () => {
      if (!res.headersSent) {
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        this.loggingService.logResponse(
          method,
          url,
          res.statusCode,
          responseTime,
        );
      }
    });

    next();
  }
}
