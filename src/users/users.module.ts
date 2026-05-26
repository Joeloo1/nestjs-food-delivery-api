import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { Driver } from './entities/driver.entity';
import { DriverLocation } from './entities/driver-location.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Driver, DriverLocation])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
