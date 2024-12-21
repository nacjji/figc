import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import databaseConfig from './config/db-config.config';
import { AdminModule } from './router/admin/admin.module';
import { ClientModule } from './router/client/client.module';
import { AuthModule } from './router/common/auth/auth.module';
import { CommonModule } from './router/common/common/common.module';
import { UserModule } from './router/user/user.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return {
          type: 'mysql',
          host: configService.get('database.host'),
          port: configService.get('database.port'),
          username: configService.get('database.username'),
          password: configService.get('database.password'),
          database: configService.get('database.database'),
          autoLoadEntities: true,
          timezone: '',
          charset: 'utf8mb4',
          synchronize: false,
          logging: false,
        };
      },
    }),
    UserModule,
    AdminModule,
    AuthModule,
    ClientModule,
    CommonModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
