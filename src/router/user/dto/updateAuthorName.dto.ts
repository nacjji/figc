import { ApiPropertyOptional } from '@nestjs/swagger';
import { MaxLength } from 'class-validator';

export class UpdateAuthorNameDto {
  @ApiPropertyOptional({ type: 'string', maxLength: 10, example: '김필명' })
  @MaxLength(10)
  public authorName: string;
}
