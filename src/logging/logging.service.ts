import { Injectable } from '@nestjs/common';
import {
  writeFileSync,
  existsSync,
  mkdirSync,
  statSync,
  unlinkSync,
  readdirSync,
  renameSync,
} from 'fs';
import { join } from 'path';

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  LOG = 2,
  DEBUG = 3,
  VERBOSE = 4,
}

@Injectable()
export class LoggingService {
  private readonly logLevel: LogLevel;
  private readonly maxFileSize: number;
  private readonly logsDir: string;
  private readonly logFile: string;
  private readonly errorLogFile: string;

  constructor() {
    this.logLevel = parseInt(process.env.LOG_LEVEL || '2', 10);
    this.maxFileSize =
      parseInt(process.env.MAX_LOG_FILE_SIZE || '1024', 10) * 1024;
    this.logsDir = process.env.LOGS_DIR || 'logs';
    this.logFile = join(this.logsDir, 'app.log');
    this.errorLogFile = join(this.logsDir, 'error.log');

    this.ensureLogDirectory();
  }

  private ensureLogDirectory(): void {
    if (!existsSync(this.logsDir)) {
      mkdirSync(this.logsDir, { recursive: true });
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.logLevel;
  }

  private formatMessage(
    level: string,
    message: string,
    context?: string,
  ): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` [${context}]` : '';
    return `${timestamp} [${level}]${contextStr} ${message}\n`;
  }

  private writeToFile(filePath: string, message: string): void {
    try {
      this.rotateLogIfNeeded(filePath);
      writeFileSync(filePath, message, { flag: 'a' });
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  private rotateLogIfNeeded(filePath: string): void {
    if (!existsSync(filePath)) {
      return;
    }

    const stats = statSync(filePath);
    if (stats.size >= this.maxFileSize) {
      this.rotateLogFile(filePath);
    }
  }

  private rotateLogFile(filePath: string): void {
    const directory = filePath.substring(0, filePath.lastIndexOf('/'));
    const fileName = filePath.substring(filePath.lastIndexOf('/') + 1);
    const baseName = fileName.substring(0, fileName.lastIndexOf('.'));
    const extension = fileName.substring(fileName.lastIndexOf('.'));

    try {
      const files = readdirSync(directory)
        .filter((file) => file.startsWith(baseName) && file.includes('.'))
        .sort((a, b) => {
          const aNum = this.getRotationNumber(a);
          const bNum = this.getRotationNumber(b);
          return bNum - aNum;
        });

      for (const file of files) {
        const currentNum = this.getRotationNumber(file);
        const nextNum = currentNum + 1;
        const currentPath = join(directory, file);
        const nextPath = join(directory, `${baseName}.${nextNum}${extension}`);

        if (nextNum > 5) {
          unlinkSync(currentPath);
        } else {
          renameSync(currentPath, nextPath);
        }
      }

      const rotatedPath = join(directory, `${baseName}.1${extension}`);
      renameSync(filePath, rotatedPath);
    } catch (error) {
      console.error('Failed to rotate log file:', error);
    }
  }

  private getRotationNumber(fileName: string): number {
    const match = fileName.match(/\.(\d+)\./);
    return match ? parseInt(match[1], 10) : 0;
  }

  error(message: string, trace?: string, context?: string): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      const logMessage = this.formatMessage('ERROR', message, context);
      const errorMessage = trace ? `${logMessage}${trace}\n` : logMessage;

      console.error(errorMessage.trim());
      this.writeToFile(this.logFile, errorMessage);
      this.writeToFile(this.errorLogFile, errorMessage);
    }
  }

  warn(message: string, context?: string): void {
    if (this.shouldLog(LogLevel.WARN)) {
      const logMessage = this.formatMessage('WARN', message, context);
      console.warn(logMessage.trim());
      this.writeToFile(this.logFile, logMessage);
    }
  }

  log(message: string, context?: string): void {
    if (this.shouldLog(LogLevel.LOG)) {
      const logMessage = this.formatMessage('LOG', message, context);
      console.log(logMessage.trim());
      this.writeToFile(this.logFile, logMessage);
    }
  }

  debug(message: string, context?: string): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      const logMessage = this.formatMessage('DEBUG', message, context);
      console.debug(logMessage.trim());
      this.writeToFile(this.logFile, logMessage);
    }
  }

  verbose(message: string, context?: string): void {
    if (this.shouldLog(LogLevel.VERBOSE)) {
      const logMessage = this.formatMessage('VERBOSE', message, context);
      console.log(logMessage.trim());
      this.writeToFile(this.logFile, logMessage);
    }
  }

  logRequest(
    method: string,
    url: string,
    query: any,
    body: any,
    statusCode?: number,
  ): void {
    const queryStr = Object.keys(query).length > 0 ? JSON.stringify(query) : '';
    const bodyStr = body ? JSON.stringify(body) : '';
    const message = `${method} ${url} Query: ${queryStr} Body: ${bodyStr}${statusCode ? ` - Status: ${statusCode}` : ''}`;
    this.log(message, 'Request');
  }

  logResponse(
    method: string,
    url: string,
    statusCode: number,
    responseTime?: number,
  ): void {
    const timeStr = responseTime ? ` - ${responseTime}ms` : '';
    const message = `${method} ${url} - ${statusCode}${timeStr}`;
    this.log(message, 'Response');
  }
}
