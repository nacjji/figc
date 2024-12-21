import { ApiPropertyOptional } from '@nestjs/swagger';
import { PageParamDto } from 'src/common/dto/pageParam.dto';

export class SearchParamDto extends PageParamDto {
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

  @ApiPropertyOptional({
    description: '모듈 id',
    nullable: true,
  })
  public moduleId: number;

  @ApiPropertyOptional({
    description: '강사 id',
    nullable: true,
  })
  public instructorId: number;
}
