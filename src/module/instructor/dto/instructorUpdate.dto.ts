import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { CreateInstructorDto } from './instructorCreate.dto';

export class UpdateInstructorDto extends CreateInstructorDto {
  @ApiProperty({
    required: true,
    description: '강사 ID',
    example: 1,
    type: 'int',
  })
  @Transform((o) => Number(o.value))
  public id: number;
}
