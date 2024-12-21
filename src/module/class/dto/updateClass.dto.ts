import { ApiProperty, ApiPropertyOptional, PickType } from '@nestjs/swagger';
import { IsEither } from 'src/common/decorator/isEitherModule.decorator';
import { ClassEntity } from 'src/entity/class.entity';
import { FileUploadedData } from 'src/module/multer-config/multer-config.service';

export class UpdateClassDto extends PickType(ClassEntity, [
  'title',
  'videoUrl',
  'instructorId',
  'question',
  'endDate',
  'moduleId',
  'adminId',
  'taskType',
  'description',
  'introduction',
]) {
  @ApiProperty({
    example: 1,
    description: '강의 id',
    required: true,
  })
  public id: number;

  @ApiProperty({
    required: false,
    description: '첨부 자료',
    type: 'string',
    format: 'binary',
  })
  public document: FileUploadedData[];

  @ApiPropertyOptional({
    required: false,
    description: '모듈명',
    type: 'string',
  })
  @IsEither('moduleId', 'moduleName')
  public moduleName: string;
}
