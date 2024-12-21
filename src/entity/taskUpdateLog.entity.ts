import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CommonDate } from './commonEntity/commonDate.entity';
import { TaskEntity } from './task.entity';
import { UserEntity } from './user.entity';

@Entity({ name: 'figc_task_update_log' })
export class TaskUpdateLogEntity extends CommonDate {
  @PrimaryGeneratedColumn({ type: 'int', comment: 'update log id' })
  public id: number;

  @Column({ name: 'user_id', type: 'int' })
  public userId: number;

  @Column({ name: 'task_id', type: 'int' })
  public taskId: number;

  @Column({ name: 'before_content', type: 'text' })
  public beforeContent: string;

  @ManyToOne(() => UserEntity, (user) => user.id)
  @JoinColumn({ name: 'user_id' })
  public user: UserEntity;

  @ManyToOne(() => TaskEntity, (task) => task.id)
  @JoinColumn({ name: 'task_id' })
  public task: TaskEntity;
}
