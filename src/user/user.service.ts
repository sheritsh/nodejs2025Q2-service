import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';
import { DatabaseService } from '../database/database.service';
import { User, UserResponse } from '../interfaces/user.interface';
import { CreateUserDto, UpdatePasswordDto } from '../dto/user.dto';

@Injectable()
export class UserService {
  constructor(private readonly databaseService: DatabaseService) {}

  findAll(): UserResponse[] {
    return this.databaseService.getUsers().map(this.excludePassword);
  }

  findOne(id: string): UserResponse {
    const user = this.databaseService.getUserById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.excludePassword(user);
  }

  findByLogin(login: string): User | undefined {
    return this.databaseService.getUsers().find((user) => user.login === login);
  }

  async create(createUserDto: CreateUserDto): Promise<UserResponse> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user: User = {
      id: randomUUID(),
      login: createUserDto.login,
      password: hashedPassword,
      version: 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const createdUser = this.databaseService.addUser(user);
    return this.excludePassword(createdUser);
  }

  async update(
    id: string,
    updatePasswordDto: UpdatePasswordDto,
  ): Promise<UserResponse> {
    const user = this.databaseService.getUserById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isOldPasswordValid = await bcrypt.compare(
      updatePasswordDto.oldPassword,
      user.password,
    );
    if (!isOldPasswordValid) {
      throw new ForbiddenException('Old password is incorrect');
    }

    const hashedNewPassword = await bcrypt.hash(
      updatePasswordDto.newPassword,
      10,
    );

    const updatedUser = this.databaseService.updateUser(id, {
      password: hashedNewPassword,
      version: user.version + 1,
      updatedAt: Date.now(),
    });

    return this.excludePassword(updatedUser!);
  }

  remove(id: string): void {
    const user = this.databaseService.getUserById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    this.databaseService.deleteUser(id);
  }

  async validatePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  private excludePassword(user: User): UserResponse {
    const userResponse = structuredClone(user);
    delete userResponse.password;
    return userResponse;
  }
}
