import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsNumber, IsOptional } from 'class-validator';
import { PageParamDto } from 'src/common/dto/pageParam.dto';

export class AssignmentFilterDto extends PageParamDto {
  @ApiProperty({
    required: false,
    description: '상태를 입력합니다. [Y, N, W]',
    default: '',
  })
  @IsOptional()
  @IsIn(['Y', 'N', 'W'])
  public status: string;

  @ApiProperty({
    required: false,
    description: '모듈을 입력합니다.',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  public moduleId: number;
}
