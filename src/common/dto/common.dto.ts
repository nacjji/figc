import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class IdDto {
  @ApiPropertyOptional({
    required: false,
    description: 'ID를 입력합니다.',
    type: 'number',
  })
  @Transform(({ value }) => parseInt(value, 10))
  public id: number;
}

export class PagenationDto {
  @ApiPropertyOptional({
    required: true,
    description: 'page를 입력합니다.',
    type: 'number',
    default: 1,
  })
  @Transform(({ value }) => parseInt(value, 10))
  public page: number;

  @ApiPropertyOptional({
    required: true,
    description: 'per를 입력합니다.',
    type: 'number',
    default: 10,
  })
  @Transform(({ value }) => parseInt(value, 10))
  public per: number;
}

export class SequenceDto {
  @ApiPropertyOptional({
    description: '강의 년도',
    example: 2024,
    nullable: true,
  })
  public year: number;

  @ApiPropertyOptional({
    description: '강의 학기',
    nullable: true,
  })
  public semester: number;

  @ApiPropertyOptional({
    description: '강의 회차',
    nullable: true,
  })
  public sequence: number;
}
