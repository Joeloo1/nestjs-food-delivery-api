import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { User } from '../users/entities/user.entity';
import { Driver } from '../users/entities/driver.entity';
import { DriverLocation } from '../users/entities/driver-location.entity';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  entities: [User, Driver, DriverLocation],

  // Where generated migration files will live
  migrations: ['src/database/migrations/*.ts'],

  // NEVER true here — the whole point of migrations is explicit control
  synchronize: false,
});
