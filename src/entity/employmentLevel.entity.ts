import {
  Column,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('employment_level')
export class EmploymentLevelEntity {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ length: 10, nullable: true })
  public name: string;

  @DeleteDateColumn({ type: 'timestamp', name: 'deleted_at', nullable: true })
  public deletedAt: Date;
}
