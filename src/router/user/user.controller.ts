import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { RES_MSG } from 'src/common/constant/response.constant';
import { ResponseMessage } from 'src/common/decorator/response.decorator';
import { UserPayload } from 'src/common/decorator/user.decorator';
import { IdDto } from 'src/common/dto/common.dto';
import { ClassService } from 'src/module/class/class.service';

import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import {
  FileUploadedData,
  MulterConfigService,
} from 'src/module/multer-config/multer-config.service';
import { UpdateTaskDto } from 'src/module/task/dto/updateTask.dto';
import { TaskService } from 'src/module/task/task.service';
import { AssignmentFilterDto } from './dto/assignmentFilter.dto';
import { CreateTaskDto } from './dto/createTask.dto';
import { UpdateAuthorNameDto } from './dto/updateAuthorName.dto';
import { UserDto } from './dto/user.dto';
import { UserService } from './user.service';

@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(
    private readonly classService: ClassService,
    private readonly multerConfigService: MulterConfigService,
    private readonly taskService: TaskService,
    private readonly userService: UserService,
  ) {}

  @ApiOperation({
    summary: '강의 상세',
  })
  @ResponseMessage(RES_MSG.CLASS_DETAIL)
  @Get('class')
  async classDetail(@Query() id: IdDto, @UserPayload() user: UserDto) {
    return await this.classService.classDetail(id, user);
  }

  @ApiOperation({
    summary: '과제 관리 summary',
  })
  @ResponseMessage(RES_MSG.TASK_LIST)
  @Get('assignment/summary')
  async assignmentSummary(@UserPayload() user: UserDto) {
    return await this.taskService.getAssignmentSummary(user);
  }

  @ApiOperation({
    summary: '과제 관리 list',
  })
  @ResponseMessage(RES_MSG.TASK_LIST)
  @Get('assignment/list')
  async assignmentList(
    @UserPayload() user: UserDto,
    @Query() dto: AssignmentFilterDto,
  ) {
    return await this.taskService.getAssignmentList(user, dto);
  }

  @ApiOperation({
    summary: '과제 상세 불러오기',
  })
  @ResponseMessage(RES_MSG.TASK_DETAIL)
  @Get('assignment/detail/:id')
  async taskDetail(@UserPayload() user: UserDto, @Param() id: IdDto) {
    if (!id.id) throw new BadRequestException('ID를 입력해주세요.');

    return await this.taskService.taskDetail(id.id, false, user);
  }

  @ApiOperation({ summary: '과제 제출' })
  @UseInterceptors(FileFieldsInterceptor([{ name: 'taskFile', maxCount: 1 }]))
  @ApiConsumes('multipart/form-data')
  @ResponseMessage(RES_MSG.TASK_CREATE)
  @Post('task')
  async createTask(
    @Body() dto: CreateTaskDto,
    @UserPayload() user: UserDto,
    @UploadedFiles()
    files: {
      taskFile: Express.Multer.File[];
    },
  ): Promise<void> {
    let file: FileUploadedData[] = null;
    if (files.taskFile && files.taskFile.length) {
      file = await this.multerConfigService.multerUploader(
        files['taskFile'],
        'task',
      );
    } else file = undefined;

    return await this.taskService.createTask(dto, user, file);
  }

  @ApiOperation({ summary: '과제 수정' })
  @UseInterceptors(FileFieldsInterceptor([{ name: 'taskFile', maxCount: 1 }]))
  @ApiConsumes('multipart/form-data')
  @Put('task')
  async updateTask(
    @Body() dto: UpdateTaskDto,
    @UserPayload() user: UserDto,
    @UploadedFiles()
    file: {
      taskFile: Express.Multer.File[];
    },
  ) {
    let taskFile: FileUploadedData[] = null;

    if (file.taskFile && file.taskFile.length) {
      taskFile = await this.multerConfigService.multerUploader(
        file['taskFile'],
        'task',
        false,
      );
    } else taskFile = undefined;

    await this.taskService.updateTask(dto, taskFile, user);
  }

  @ApiOperation({
    summary: '전체 회차 리스트 불러오기',
  })
  @ResponseMessage(RES_MSG.CLASS_ALL_LIST)
  @Get('class/list')
  async getClassList() {
    return await this.taskService.getClassList();
  }

  @ResponseMessage(RES_MSG.UPDATE_AUTHORNAME)
  @ApiOperation({ summary: '필명 변경' })
  @Put('authorname')
  async updateAuthorName(
    @Body() dto: UpdateAuthorNameDto,
    @UserPayload() user: UserDto,
  ) {
    return await this.userService.updateAuthorName(dto, user);
  }
}
