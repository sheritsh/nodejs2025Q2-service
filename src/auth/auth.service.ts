import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { UserService } from '../user/user.service';
import {
  SignupDto,
  LoginDto,
  RefreshDto,
  AuthResponse,
  JwtPayload,
} from './dto/auth.dto';
import { DatabaseService } from '../database/database.service';
import { UserResponse } from '../interfaces/user.interface';

@Injectable()
export class AuthService {
  private readonly jwtSecret: string;
  private readonly jwtRefreshSecret: string;
  private readonly jwtExpirationTime: string;
  private readonly jwtRefreshExpirationTime: string;
  private refreshTokens = new Set<string>();

  constructor(
    private readonly userService: UserService,
    private readonly databaseService: DatabaseService,
  ) {
    this.jwtSecret = process.env.JWT_SECRET_KEY || 'default-secret';
    this.jwtRefreshSecret =
      process.env.JWT_SECRET_REFRESH_KEY || 'default-refresh-secret';
    this.jwtExpirationTime = process.env.JWT_EXPIRATION_TIME || '15m';
    this.jwtRefreshExpirationTime =
      process.env.JWT_REFRESH_EXPIRATION_TIME || '7d';
  }

  async signup(signupDto: SignupDto): Promise<UserResponse> {
    const existingUser = this.userService.findByLogin(signupDto.login);
    if (existingUser) {
      throw new BadRequestException('User with this login already exists');
    }

    const createdUser = await this.userService.create(signupDto);
    return createdUser;
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const user = this.userService.findByLogin(loginDto.login);
    if (!user) {
      throw new ForbiddenException('Invalid credentials');
    }

    const isPasswordValid = await this.userService.validatePassword(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new ForbiddenException('Invalid credentials');
    }

    const payload: JwtPayload = {
      userId: user.id,
      login: user.login,
    };

    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload);

    this.refreshTokens.add(refreshToken);

    return {
      accessToken,
      refreshToken,
    };
  }

  async refresh(refreshDto: RefreshDto): Promise<AuthResponse> {
    if (!refreshDto.refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    if (!this.refreshTokens.has(refreshDto.refreshToken)) {
      throw new ForbiddenException('Invalid refresh token');
    }

    try {
      const payload = jwt.verify(
        refreshDto.refreshToken,
        this.jwtRefreshSecret,
      ) as JwtPayload;

      const user = this.databaseService.getUserById(payload.userId);
      if (!user) {
        throw new ForbiddenException('User not found');
      }

      const newPayload: JwtPayload = {
        userId: user.id,
        login: user.login,
      };

      const accessToken = this.generateAccessToken(newPayload);
      const refreshToken = this.generateRefreshToken(newPayload);

      this.refreshTokens.delete(refreshDto.refreshToken);
      this.refreshTokens.add(refreshToken);

      return {
        accessToken,
        refreshToken,
      };
    } catch (error) {
      this.refreshTokens.delete(refreshDto.refreshToken);
      throw new ForbiddenException('Invalid or expired refresh token');
    }
  }

  validateAccessToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, this.jwtSecret) as JwtPayload;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired access token');
    }
  }

  private generateAccessToken(payload: JwtPayload): string {
    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpirationTime,
    } as jwt.SignOptions);
  }

  private generateRefreshToken(payload: JwtPayload): string {
    return jwt.sign(payload, this.jwtRefreshSecret, {
      expiresIn: this.jwtRefreshExpirationTime,
    } as jwt.SignOptions);
  }
}
