import { ApiPropertyOptional } from '@nestjs/swagger';

export class SemesterDto {
  @ApiPropertyOptional({ description: '학기' })
  public semester: number;
}
