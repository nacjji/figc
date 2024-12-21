import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { CommonDate } from './commonEntity/commonDate.entity';

@Entity('figc_instructor')
export class InstructorEntity extends CommonDate {
  // 강사 아이디
  @PrimaryGeneratedColumn()
  public id: number;

  // 강사 이름
  @ApiProperty({
    description: '강사 이름',
    example: '홍길동',
    type: 'string',
  })
  @Column({ name: 'instructor_name' })
  public instructorName: string;

  // 강사 이메일
  @ApiProperty({
    description: '강사 이메일',
    example: 'example@gmail.com',
    type: 'string',
  })
  @Column({ name: 'instructor_email', nullable: false })
  public instructorEmail: string;

  // 강사 전화번호
  @ApiPropertyOptional({
    description: '강사 전화번호',
    example: '01012341234',
    type: 'string',
  })
  @Column({ name: 'instructor_phone', nullable: true })
  public instructorPhone: string;

  // 강사 소개
  @ApiProperty({
    description: '강사 소개',
    example: '강사 소개가 들어갑니다.',
    type: 'string',
  })
  @Column({ name: 'instructor_introduce', nullable: false })
  public instructorIntroduce: string;

  @ApiPropertyOptional({
    description: 'inst_ructor',
    example: '강사 인스타그램 주소가 들어갑니다.',
    type: 'string',
  })
  @Column({ name: 'instructor_instagram', type: 'varchar', nullable: true })
  public instructorInstagram: string;

  @ApiPropertyOptional({
    description: '홈페이지 주소',
    example: '홈페이지 주소가 들어갑니다.',
    type: 'string',
  })
  @Column({ name: 'homepage', type: 'varchar', nullable: true })
  public homepage: string;
}
