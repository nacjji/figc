import { BadRequestException } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ClassEntity } from './class.entity';
import { CommonDate } from './commonEntity/commonDate.entity';
import { UserEntity } from './user.entity';

@Entity({ name: 'task' })
export class TaskEntity extends CommonDate {
  @PrimaryGeneratedColumn({ name: 'id' })
  public id: number;

  @ApiProperty({
    required: true,
    example: 1,
    description: '강의 id',
    type: 'integer',
  })
  @Transform(({ value }) => Number(value))
  @Column({ name: 'class_id', type: 'int', comment: '강의 id' })
  public classId: number;

  @Column({ name: 'user_id', type: 'int', comment: '제출자' })
  public userId: number;

  @ApiPropertyOptional({
    required: false,
    example: '홍길동',
    description: '필명',
  })
  @Column({
    name: 'author_name',
    type: 'varchar',
    comment: '필명',
    nullable: true,
  })
  public authorName: string;

  @Column({ name: 'like_cnt', type: 'int', default: 0, comment: '좋아요 수' })
  public likeCnt: number;

  @ApiProperty({
    required: true,
    example: '텍스트 과제',
    description: '텍스트 과제',
  })
  @Column({
    name: 'text',
    type: 'varchar',
    length: 400,
    comment: '텍스트 과제',
  })
  @IsOptional()
  @Transform((v) => {
    if (!v.value) throw new BadRequestException('답변을 입력해주세요.');

    if (v.value === 'undefined') return '';
    else if (v.value.length < 200 || v.value.length > 400)
      throw new BadRequestException(
        '답변은 200이상 400자 이내로 작성해주세요.',
      );

    return v.value;
  })
  public text: string;

  @ManyToOne(() => ClassEntity)
  @JoinColumn({ name: 'class_id' })
  public class: ClassEntity;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  public user: UserEntity;
}
