import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateInstructorDto {
  @ApiProperty({
    example: '김강사',
    description: '강사 이름',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  // 필수
  public name: string;

  @ApiProperty({
    example: 'example@gmail.com',
    description: '강사 이메일',
    required: true,
  })
  @IsString()
  public email: string;
  @ApiPropertyOptional({
    example: '010-1234-5678',
    description: '강사 전화번호',
    required: false,
  })
  @IsString()
  public phoneNumber: string;
  @ApiPropertyOptional({
    example: '강사 소개',
    description: '강사 소개',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  public introduction: string;
  @ApiPropertyOptional({
    example: 'https://www.instagram.com/example',
    description: '강사 인스타그램',
    required: false,
  })
  public instagram: string;

  @ApiPropertyOptional({
    example: 'https://www.homepage.com/example',
    description: '강사 홈페이지',
    required: false,
  })
  @IsString()
  public homepage: string;
}
