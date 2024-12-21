import { ApiProperty, ApiPropertyOptional, PickType } from '@nestjs/swagger';
import { IsNotEmpty, ValidateIf } from 'class-validator';
import { ClassEntity } from 'src/entity/class.entity';
import { FileUploadedData } from 'src/module/multer-config/multer-config.service';

export class CreateClassDto extends PickType(ClassEntity, [
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
  @ValidateIf((o) => !o.moduleId)
  @IsNotEmpty()
  public moduleName: string;
}
