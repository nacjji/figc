import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminListEntity } from 'src/entity/adminList.entity';
import { AuthorNameEntity } from 'src/entity/authorName.entity';
import { ClassEntity } from 'src/entity/class.entity';
import { ClosureDepartment } from 'src/entity/closureDepartment.entity';
import { FigcConfigEntity } from 'src/entity/figcConfig.entity';
import { FigcFileEntity } from 'src/entity/figcFile.entity';
import { InstructorEntity } from 'src/entity/instructor.entity';
import { ModuleEntity } from 'src/entity/module.entity';
import { TaskEntity } from 'src/entity/task.entity';
import { TaskFileRelationEntity } from 'src/entity/taskFileRelation.entity';
import { TaskUpdateLogEntity } from 'src/entity/taskUpdateLog.entity';
import { UserEntity } from 'src/entity/user.entity';
import { ClassService } from 'src/module/class/class.service';
import { ModuleService } from 'src/module/classModule/classModule.service';
import { InstructorService } from 'src/module/instructor/instructor.service';
import { MulterConfigService } from 'src/module/multer-config/multer-config.service';
import { TaskService } from 'src/module/task/task.service';
import { UserService } from '../user/user.service';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ClassEntity,
      TaskEntity,
      TaskFileRelationEntity,
      UserEntity,
      FigcFileEntity,
      FigcConfigEntity,
      ModuleEntity,
      InstructorEntity,
      AuthorNameEntity,
      ClosureDepartment,
      AdminListEntity,
      TaskUpdateLogEntity,
    ]),
  ],
  controllers: [AdminController],
  providers: [
    AdminService,
    MulterConfigService,
    ClassService,
    TaskService,
    InstructorService,
    UserService,
    ModuleService,
  ],
})
export class AdminModule {}
