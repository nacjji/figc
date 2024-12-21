import {
  Column,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'job_position' })
export class JobPositionEntity {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ name: 'position_code', length: 10, nullable: true })
  public positionCode: string;

  @Column({ length: 40, nullable: true })
  public name: string;

  @DeleteDateColumn({ type: 'timestamp', name: 'deleted_at', nullable: true })
  public deletedAt: Date;
}
