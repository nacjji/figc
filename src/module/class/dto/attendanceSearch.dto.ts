import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import { IdDto } from 'src/common/dto/common.dto';

export class AttendanceSearchDto extends IdDto {
  @ApiPropertyOptional({
    example: 2,
    description: '부문 ID',
    required: false,
  })
  @IsOptional()
  public division: number;

  @ApiPropertyOptional({
    example: 'Y',
    description: '진행 상태 (Y: 제출완료, N: 미제출)',
    required: false,
  })
  @IsOptional()
  @IsIn(['Y', 'N'])
  public isSubmit: 'Y';
}
