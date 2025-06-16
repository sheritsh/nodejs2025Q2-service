import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { LoggingService } from './logging/logging.service';
import { GlobalExceptionFilter } from './logging/exception.filter';
import 'dotenv/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const loggingService = app.get(LoggingService);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new GlobalExceptionFilter(loggingService));

  app.enableCors();

  process.on('uncaughtException', (error: Error) => {
    loggingService.error(
      `Uncaught Exception: ${error.message}`,
      error.stack,
      'UncaughtException',
    );
    process.exit(1);
  });

  process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    loggingService.error(
      `Unhandled Rejection at: ${promise}, reason: ${reason}`,
      reason?.stack || String(reason),
      'UnhandledRejection',
    );
    process.exit(1);
  });

  const port = process.env.PORT || 4000;
  await app.listen(port);

  loggingService.log(`Application is running on port ${port}`, 'Bootstrap');
}

bootstrap().catch((error) => {
  console.error('Error starting application:', error);
  process.exit(1);
});
