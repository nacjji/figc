import {
  Column,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('department')
export class DepartmentEntity {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ length: 30, nullable: true })
  public name: string;

  @DeleteDateColumn({ type: 'timestamp', name: 'deleted_at', nullable: true })
  public deletedAt: Date;
}
