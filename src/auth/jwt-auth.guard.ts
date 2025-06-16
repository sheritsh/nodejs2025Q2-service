import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const { url } = request;

    const excludedPaths = [
      '/auth/signup',
      '/auth/login',
      '/auth/refresh',
      '/doc',
      '/',
    ];

    const isExcluded = excludedPaths.some((path) => {
      if (path === '/') {
        return url === '/';
      }
      return url.startsWith(path);
    });

    if (isExcluded) {
      return true;
    }

    const authHeader = request.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('Authorization header is missing');
    }

    const [scheme, token] = authHeader.split(' ');
    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedException(
        'Invalid authorization scheme. Use Bearer token',
      );
    }

    try {
      const payload = this.authService.validateAccessToken(token);
      request['user'] = payload;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired access token');
    }
  }
}
