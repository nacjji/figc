import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassEntity } from 'src/entity/class.entity';
import { InstructorEntity } from 'src/entity/instructor.entity';
import { TaskEntity } from 'src/entity/task.entity';
import { ClassService } from 'src/module/class/class.service';
import { InstructorService } from 'src/module/instructor/instructor.service';
import { TaskService } from 'src/module/task/task.service';
import { ClientController } from './client.controller';
import { ClientService } from './client.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([InstructorEntity, TaskEntity, ClassEntity]),
  ],
  controllers: [ClientController],
  providers: [ClientService, TaskService, ClassService, InstructorService],
})
export class ClientModule {}
