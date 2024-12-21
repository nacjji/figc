import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class ClassListDto {
  @ApiPropertyOptional({
    required: false,
    description: '모듈 ID를 입력합니다.',
    type: 'number',
  })
  @Transform(({ value }) => parseInt(value, 10))
  public moduleId: number;

  @ApiPropertyOptional({
    required: false,
    description: '강사 ID를 입력합니다.',
    type: 'number',
  })
  @Transform(({ value }) => parseInt(value, 10))
  public instructorId: number;

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
