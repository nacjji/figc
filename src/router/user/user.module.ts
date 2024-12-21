import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthorNameEntity } from 'src/entity/authorName.entity';
import { ClosureDepartment } from 'src/entity/closureDepartment.entity';
import { DefaultProfileEntity } from 'src/entity/defaultProfile.entity';
import { DepartmentEntity } from 'src/entity/department.entity';
import { EmploymentLevelEntity } from 'src/entity/employmentLevel.entity';
import { InstructorEntity } from 'src/entity/instructor.entity';
import { JobPositionEntity } from 'src/entity/position.entity';
import { ProfileFileEntity } from 'src/entity/profileImage.entity';
import { UserEntity } from 'src/entity/user.entity';
import { ClassService } from 'src/module/class/class.service';
import { InstructorService } from 'src/module/instructor/instructor.service';
import { MulterConfigService } from 'src/module/multer-config/multer-config.service';
import { TaskService } from 'src/module/task/task.service';
import { AuthService } from '../common/auth/auth.service';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      DepartmentEntity,
      JobPositionEntity,
      EmploymentLevelEntity,
      ProfileFileEntity,
      DefaultProfileEntity,
      InstructorEntity,
      ClosureDepartment,
      AuthorNameEntity,
    ]),
  ],
  controllers: [UserController],
  providers: [
    UserService,
    TaskService,
    MulterConfigService,
    ClassService,
    InstructorService,
    AuthService,
    JwtService,
  ],
})
export class UserModule {}
