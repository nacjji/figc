import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { ClassListDto } from './classList.dto';

export class ClassListClientDto extends ClassListDto {
  @ApiPropertyOptional({
    required: false,
    description: 'ID를 입력합니다.',
    type: 'number',
  })
  @Transform(({ value }) => parseInt(value, 10))
  public id: number;
}
