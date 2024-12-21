import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsDate,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CommonDate } from './commonEntity/commonDate.entity';
import { FigcFileEntity } from './figcFile.entity';
import { InstructorEntity } from './instructor.entity';
import { ModuleEntity } from './module.entity';
import { TaskEntity } from './task.entity';
import { UserEntity } from './user.entity';

@Entity({ name: 'class' })
export class ClassEntity extends CommonDate {
  @PrimaryGeneratedColumn({ name: 'id', type: 'int', comment: '강의 id' })
  public id: number;

  @Column({
    name: 'status',
    type: 'char',
    length: 1,
    default: 'I',
    comment: ' I: 진행중, E: 종료)',
  })
  public status: string;

  @Column({ name: 'year', type: 'int', comment: '연도' })
  public year: number;

  @Column({ name: 'semester', type: 'int', comment: '학기' })
  public semester: number;

  @Column({ name: 'sequence', type: 'int', comment: '회차' })
  public sequence: number;

  @ApiProperty({
    name: 'is_private',
    type: 'string',
    default: 'N',
    description: '비공개 여부 Y : 비공개, N : 공개',
  })
  @Column({
    name: 'is_private',
    type: 'char',
    length: 1,
    default: 'N',
    comment: '비공개 여부 Y : 비공개, N : 공개',
  })
  public isPrivate: string;

  @ApiProperty({
    required: true,
    description: '강사 ID',
    example: 1,
    type: 'int',
  })
  @Column({
    name: 'instructor_id',
    type: 'int',
    nullable: false,
    comment: '강사 ID',
  })
  public instructorId: number;

  @ApiProperty({
    required: true,
    description: '강의 제목',
    example: '강의 제목이 들어갑니다.',
    type: 'string',
  })
  @IsString()
  @IsNotEmpty()
  @Column({ name: 'title', type: 'varchar', length: 100, comment: '강의 제목' })
  public title: string;

  @ApiProperty({
    required: true,
    description: '강의 영상 url',
    example: 'https://www.youtube.com/watch?v=jryQwLm9f8k',
    type: 'string',
  })
  @IsUrl()
  @IsNotEmpty()
  @Column({
    name: 'video_url',
    type: 'varchar',
    length: 255,
    comment: '강의 영상 url',
  })
  public videoUrl: string;

  @ApiProperty({
    required: true,
    type: 'string',
    description: '과제 질문',
    example: '상업 영역에서 크리에이티브는 무엇일까요?',
  })
  @Column({
    name: 'question',
    type: 'varchar',
    length: 200,
    nullable: true,
    comment: '과제 질문',
  })
  @IsString()
  @IsOptional()
  public question: string;

  @ApiProperty({
    required: true,
    type: 'date',
    description: '과제 제출 마감일',
    nullable: true,
    example: '2024.04.25',
  })
  @Column({
    name: 'end_date',
    type: 'date',
    nullable: true,
    comment: '과제 제출 마감일',
  })
  @IsOptional()
  @IsDate()
  @Transform(({ value }) => {
    return value ? new Date(value) : null;
  })
  public endDate: Date;

  @Column({ name: 'admin_id', type: 'int', comment: '등록자' })
  public adminId: number;

  @ApiProperty({
    required: false,
    type: 'string',
    description: '과제 타입 (T: 텍스트, I: 이미지, V: 비디오)',
    example: 'T',
  })
  @Column({
    name: 'task_type',
    type: 'char',
    length: 1,
    nullable: true,
    comment: '과제 타입 (T: 텍스트, I: 이미지, V: 비디오)',
  })
  @IsOptional()
  @IsIn(['T', 'I', 'V', 'undefined'])
  @Transform((value) => (value.value === 'undefined' ? null : value.value))
  public taskType: string;

  @ApiProperty({
    required: true,
    type: 'string',
    description: '부가 설명',
    example: '질문에 관련된 부가설명이 들어갑니다.',
  })
  @IsString()
  @Column({
    name: 'description',
    type: 'text',
    nullable: true,
    comment: '부가 설명',
  })
  @IsOptional()
  public description: string;

  @ApiProperty({
    required: false,
    type: 'string',
    description: '강의 소개',
    example: '강의 소개가 들어갑니다.',
  })
  @Column({
    name: 'introduction',
    type: 'text',
    nullable: true,
    comment: '강의 소개',
  })
  @IsOptional()
  public introduction: string;

  @Column({
    name: 'document_id',
    type: 'int',
    nullable: true,
    comment: '첨부 자료 file id',
  })
  @IsOptional()
  public documentId: number;

  @ApiProperty({
    required: false,
    type: 'number',
    description: '모듈 id',
    example: 1,
  })
  @Column({ name: 'module_id', type: 'int', comment: '모듈 id' })
  public moduleId: number;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'admin_id' })
  public admin: UserEntity;

  @OneToMany(() => TaskEntity, (task) => task.class)
  public task: TaskEntity[];

  @OneToOne(() => FigcFileEntity)
  @JoinColumn({ name: 'document_id' })
  public document: FigcFileEntity[];

  @ManyToOne(() => ModuleEntity)
  @JoinColumn({ name: 'module_id' })
  public module: ModuleEntity;

  @ManyToOne(() => InstructorEntity, (instructor) => instructor.id)
  @JoinColumn({ name: 'instructor_id' })
  public instructor: InstructorEntity;
}
