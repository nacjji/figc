import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class SemesterEndDto {
  @ApiProperty({
    example: false,
    enum: [true, false],
    description:
      'isYearEnd 가 true면 연도 마감, 학기 초기화 false면 학기만 + 1',
    required: true,
  })
  @IsBoolean()
  public isYearEnd: boolean;
}
