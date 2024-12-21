import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskEntity } from 'src/entity/task.entity';
import { TaskUpdateLogEntity } from 'src/entity/taskUpdateLog.entity';
import { TaskService } from './task.service';

@Module({
  imports: [TypeOrmModule.forFeature([TaskEntity, TaskUpdateLogEntity])],
  providers: [TaskService],
})
export class TaskModule {}
