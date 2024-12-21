import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { IdDto } from 'src/common/dto/common.dto';

export class UpdateTaskAdminDto extends IdDto {
  @ApiProperty({
    required: true,
    description: '수정할 과제 내용',
    type: 'string',
  })
  @IsNotEmpty()
  public content: string;
}
