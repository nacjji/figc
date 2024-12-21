import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { PageParamDto } from 'src/common/dto/pageParam.dto';

export class TaskListDto extends PageParamDto {
  @ApiPropertyOptional({
    required: false,
    description: 'ID를 입력합니다.',
    type: 'number',
  })
  @Transform(({ value }) => parseInt(value, 10))
  public id: number;

  @ApiPropertyOptional({
    description: '강의 년도',
    example: 2024,
    nullable: true,
  })
  public year: number;

  @ApiPropertyOptional({
    description: '강의 회차',
    nullable: true,
  })
  public sequence: number;
}
