import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const config = {
          type: 'postgres' as const,
          host: configService.get<string>('database.host'),
          port: configService.get<number>('database.port'),
          username: configService.get<string>('database.username'),
          password: configService.get<string>('database.password'),
          database: configService.get<string>('database.database'),

          // Auto-load all entities decorated with @Entity()
          autoLoadEntities: true,

          // synchronize: true auto-creates tables from your entities.
          // ONLY in development — never in production (use migrations instead).
          synchronize: process.env.NODE_ENV !== 'production',

          // Logs every SQL query — useful for understanding what TypeORM does
          logging: process.env.NODE_ENV === 'development',
        };

        // console.log('🔌 TypeORM connecting to:', {
        //   host: config.host,
        //   port: config.port,
        //   username: config.username,
        //   database: config.database,
        // });

        return config;
      },
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
