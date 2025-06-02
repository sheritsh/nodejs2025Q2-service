import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
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

  create(createUserDto: CreateUserDto): UserResponse {
    const user: User = {
      id: randomUUID(),
      login: createUserDto.login,
      password: createUserDto.password,
      version: 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const createdUser = this.databaseService.addUser(user);
    return this.excludePassword(createdUser);
  }

  update(id: string, updatePasswordDto: UpdatePasswordDto): UserResponse {
    const user = this.databaseService.getUserById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.password !== updatePasswordDto.oldPassword) {
      throw new ForbiddenException('Old password is incorrect');
    }

    const updatedUser = this.databaseService.updateUser(id, {
      password: updatePasswordDto.newPassword,
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

  private excludePassword(user: User): UserResponse {
    const { ...userResponse } = user;
    delete userResponse.password;
    return userResponse;
  }
}
