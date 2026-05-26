import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserRole } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Create User
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    const existngUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existngUser) {
      throw new ConflictException('Email already Registered');
    }
    const user = this.userRepository.create({
      ...createUserDto,
      role: UserRole.CUSTOMER,
    });

    return await this.userRepository.save(user);
  }

  /**
   * Get User By Email
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();
  }

  /**
   * Get the user By ID
   */
  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByIdWithRefreshToken(id: string): Promise<User | null> {
    return this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.refreshToken')
      .where('user.id = :id', { id })
      .getOne();
  }

  /**
   * Update User
   */
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);

    if (updateUserDto.password) {
      const saltRounds = Number(process.env.SALT_ROUNDS) || 10;
      updateUserDto.password = await bcrypt.hash(
        updateUserDto.password,
        saltRounds,
      );
    }

    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async updateRefreshToken(id: string, token: string | null): Promise<void> {
    await this.userRepository.update(id, { refreshToken: token });
  }
}
