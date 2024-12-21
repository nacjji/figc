import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString } from 'class-validator';

export class UserDto {
  @ApiProperty({
    example: 1,
    type: 'number',
    description: '유저 id',
  })
  @IsInt()
  public userId: number;

  @ApiProperty({
    example: '홍길동',
    description: '유저 이름',
  })
  @IsString()
  public name: string;
}
