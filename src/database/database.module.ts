import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

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

          autoLoadEntities: true,

          // In dev you can keep synchronize on while building features, but
          // once you generate your first migration switch this to false so
          // the app and the CLI stay in sync.
          synchronize: false,

          // Path to compiled migration files (dist/ because NestJS runs JS)
          migrations: ['dist/database/migrations/*.js'],

          // Run pending migrations automatically on startup
          migrationsRun: true,

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
