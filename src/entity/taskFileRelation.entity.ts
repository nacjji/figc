import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { FigcFileEntity } from './figcFile.entity';
import { TaskEntity } from './task.entity';

@Entity({ name: 'task_file_relation' })
export class TaskFileRelationEntity {
  @PrimaryGeneratedColumn({ name: 'id' })
  public id: number;

  @Column({
    name: 'type',
    type: 'char',
    length: 1,
    comment: '파일 type (I: 이미지, V: video)',
  })
  public type: string;

  @Column({ name: 'task_id', type: 'int', comment: '과제 id' })
  public taskId: number;

  @Column({ name: 'file_id', type: 'int', comment: 'file id' })
  public fileId: number;

  @ManyToOne(() => TaskEntity)
  @JoinColumn({ name: 'task_id' })
  public task: TaskEntity;

  @OneToOne(() => FigcFileEntity)
  @JoinColumn({ name: 'file_id' })
  public file: FigcFileEntity;
}
