import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class PageParamDto {
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
