import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CommonDate } from './commonEntity/commonDate.entity';
import { DefaultProfileEntity } from './defaultProfile.entity';
import { DepartmentEntity } from './department.entity';
import { EmploymentLevelEntity } from './employmentLevel.entity';
import { JobPositionEntity } from './position.entity';
import { ProfileFileEntity } from './profileImage.entity';

@Entity('user')
export class UserEntity extends CommonDate {
  @PrimaryGeneratedColumn({ name: 'id' })
  public id: number;

  @Column({
    length: 500,
    nullable: true,
    comment: '구글 로그인 시 발급되는 uid',
  })
  public uid: string;

  @Column({
    length: 1,
    default: 'Y',
    name: 'employment_status',
    comment: '재직 상태(Y: 재직중 / Q: 퇴사자 / N: 휴직자)',
  })
  public employmentStatus: string;

  @Column({ length: 255 })
  public email: string;

  @Column({ length: 255, name: 'password_hashed' })
  public passwordHashed: string;

  @Column({ name: 'position_id' })
  public positionId: number;

  @Column({ name: 'dept_id', nullable: true })
  public deptId: number;

  @Column({ name: 'employment_level_id' })
  public employmentLevelId: number;

  @Column({ name: 'profile_id', nullable: true })
  public profileId: number;

  @Column({
    name: 'default_profile_id',
    nullable: true,
    comment: '기본 프로필 id',
  })
  public defaultProfileId: number;

  @Column({
    name: 'is_default_profile',
    default: 'Y',
    comment: '기본 프로필 사용 여부 YN',
  })
  public isDefaultProfile: string;

  @Column({ length: 50 })
  public name: string;

  @Column({ length: 20, name: 'phone_number', nullable: true })
  public phoneNumber: string;

  @Column({ type: 'datetime', nullable: true })
  public birth: Date;

  @Column({ name: 'team_role', comment: '1: 부문장 / 2: 팀장 /  3: 팀원' })
  public teamRole: number;

  @Column({ name: 'device_token', nullable: true })
  public deviceToken: string;

  @CreateDateColumn({
    type: 'timestamp',
    name: 'joined_at',
    comment: '입사일',
  })
  public joinedAt: Date;

  @ManyToOne(() => JobPositionEntity)
  @JoinColumn({ name: 'position_id' })
  public position: JobPositionEntity;

  @ManyToOne(() => DepartmentEntity)
  @JoinColumn({ name: 'dept_id' })
  public department: DepartmentEntity;

  @ManyToOne(() => ProfileFileEntity)
  @JoinColumn({ name: 'profile_id' })
  public profile: ProfileFileEntity;

  @ManyToOne(() => DefaultProfileEntity)
  @JoinColumn({ name: 'default_profile_id' })
  public defaultProfile: DefaultProfileEntity;

  @ManyToOne(() => EmploymentLevelEntity)
  @JoinColumn({ name: 'employment_level_id' })
  public employmentLevel: EmploymentLevelEntity;
}
