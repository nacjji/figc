import { ApiPropertyOptional, PickType } from '@nestjs/swagger';
import { TaskEntity } from 'src/entity/task.entity';
import { FileUploadedData } from 'src/module/multer-config/multer-config.service';

export class UpdateTaskDto extends PickType(TaskEntity, [
  'id',
  'classId',
  'text',
  'authorName',
]) {
  // 과제 파일

  @ApiPropertyOptional({
    required: false,
    description: '과제 자료',
    type: 'string',
    format: 'binary',
  })
  public taskFile: FileUploadedData;
}
