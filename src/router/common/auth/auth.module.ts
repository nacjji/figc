import { Module } from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GoogleStrategy } from 'src/common/strategy/google.strategy';
import { JwtStrategy } from 'src/common/strategy/jwt.strategy';
import { AdminListEntity } from 'src/entity/adminList.entity';
import { AuthorNameEntity } from 'src/entity/authorName.entity';
import { ClosureDepartment } from 'src/entity/closureDepartment.entity';
import { UserEntity } from 'src/entity/user.entity';
import { AdminService } from 'src/router/admin/admin.service';
import { UserService } from 'src/router/user/user.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      ClosureDepartment,
      AdminListEntity,
      AuthorNameEntity,
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    GoogleStrategy,
    UserService,
    JwtStrategy,
    JwtService,
    AdminService,
  ],
})
export class AuthModule {}
