import {
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
import { Cron } from '@nestjs/schedule';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiExcludeEndpoint,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { RES_MSG } from 'src/common/constant/response.constant';
import { isPublic } from 'src/common/decorator/public.decorator';
import { ResponseMessage } from 'src/common/decorator/response.decorator';
import { UserPayload } from 'src/common/decorator/user.decorator';
import { IdDto } from 'src/common/dto/common.dto';
import { PageParamDto } from 'src/common/dto/pageParam.dto';
import { AdminGuard } from 'src/common/guards/admin.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import { ClassService } from 'src/module/class/class.service';
import { AttendanceSearchDto } from 'src/module/class/dto/attendanceSearch.dto';
import { ClassListDto } from 'src/module/class/dto/classList.dto';
import { UpdateClassDto } from 'src/module/class/dto/updateClass.dto';
import { ModuleService } from 'src/module/classModule/classModule.service';
import { CreateInstructorDto } from 'src/module/instructor/dto/instructorCreate.dto';
import { UpdateInstructorDto } from 'src/module/instructor/dto/instructorUpdate.dto';
import { InstructorService } from 'src/module/instructor/instructor.service';
import {
  FileUploadedData,
  MulterConfigService,
} from 'src/module/multer-config/multer-config.service';
import { UpdateTaskAdminDto } from 'src/module/task/dto/updateTaskAdmin.dto';
import { TaskService } from 'src/module/task/task.service';
import { CreateClassDto } from '../../module/class/dto/createClass.dto';
import { UserDto } from '../user/dto/user.dto';
import { SemesterEndDto } from './dto/semesterEnd.dto';

@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  constructor(
    private readonly multerConfigService: MulterConfigService,
    private readonly classService: ClassService,
    private readonly moduleService: ModuleService,
    private readonly instructorService: InstructorService,
    private readonly taskService: TaskService,
  ) {}

  @ApiOperation({
    summary: '학기에 진행 되었던 모듈 리스트',
    description: '강의 관리 페이지에서 사용, 모듈 검색을 위한 모듈 리스트',
  })
  @Get('module')
  async getModuleSemester() {
    return await this.moduleService.getModuleBySemester();
  }

  /* 강사 ------------------------------------------------------------------------------------ */
  @ApiOperation({ summary: '강사 등록' })
  @ResponseMessage(RES_MSG.INSTRUCTOR_REGIST)
  @Post('instructor')
  async createInstructor(@Body() dto: CreateInstructorDto): Promise<number> {
    return await this.instructorService.createInstructor(dto);
  }

  @ApiOperation({ summary: '강사 리스트' })
  @ResponseMessage(RES_MSG.INSTRUCTOR_LIST)
  @Get('instructor')
  async instructorList(@Query() query: PageParamDto) {
    return await this.instructorService.getInstructorList(query);
  }

  @ApiOperation({ summary: '강사 상세' })
  @ResponseMessage(RES_MSG.INSTRUCTOR_DETAIL)
  @Get('instructor/:id')
  async instructorDetail(@Param() param: IdDto) {
    return await this.instructorService.getInstructorDetail(param);
  }

  @ApiOperation({ summary: '강사 수정' })
  @ResponseMessage(RES_MSG.INSTRUCTOR_UPDATE)
  @Put('instructor')
  async instructorUpdate(@Body() dto: UpdateInstructorDto) {
    return await this.instructorService.updateInstructor(dto);
  }

  /* 강의 ------------------------------------------------------------------------------------ */

  @ApiOperation({
    summary: '강의 등록',
    description: `
      // 강사 먼저 등록 후 선택 
      // moduleId도 마찬가지로, __moduleId__ 를 포함해서 요청하는 경우는 기존 모듈 선택, moduleName은 empty
      // moduleId가 없고 __moduleName__ 를 포함해서 요청하는 경우 신규 모듈 등록, moduleId 는 empty, moduleName 필수
      `,
  })
  @ResponseMessage(RES_MSG.CLASS_REGIST)
  @UseInterceptors(FileFieldsInterceptor([{ name: 'document', maxCount: 1 }]))
  @ApiConsumes('multipart/form-data')
  @Post('/class')
  async create(
    @UserPayload() user: UserDto,
    @Body() dto: CreateClassDto,
    @UploadedFiles()
    files: {
      document: Express.Multer.File[];
      cover: Express.Multer.File[];
    },
  ) {
    let document: FileUploadedData[] = null;

    if (files.document && files.document.length) {
      document = await this.multerConfigService.multerUploader(
        files['document'],
        'class',
        false,
      );
    } else {
      document = undefined;
    }
    return await this.classService.createClass(document, dto, user);
  }

  @ApiOperation({ summary: '강의 상세' })
  @ResponseMessage(RES_MSG.CLASS_DETAIL)
  @Get('class/:id')
  async classDetail(@Param() param: IdDto, @UserPayload() user: UserDto) {
    return await this.classService.classDetail(param, user);
  }

  @ApiOperation({ summary: '강의 리스트' })
  @ResponseMessage(RES_MSG.CLASS_LIST)
  @Get('class')
  async classList(@Query() query: ClassListDto) {
    return await this.classService.classList(query);
  }

  @UseInterceptors(FileFieldsInterceptor([{ name: 'document', maxCount: 1 }]))
  @ApiOperation({ summary: '강의 수정' })
  @ApiConsumes('multipart/form-data')
  @ResponseMessage(RES_MSG.CLASS_UPDATE)
  @Put('class')
  async classUpdate(
    @Body() dto: UpdateClassDto,
    @UploadedFiles()
    files: {
      document: Express.Multer.File[];
    },
  ) {
    let document: FileUploadedData[] = null;

    if (files.document && files.document.length) {
      document = await this.multerConfigService.multerUploader(
        files['document'],
        'class',
        false,
      );
    } else {
      document = undefined;
    }

    return await this.classService.classUpdate(document, dto);
  }

  /* 과제 ------------------------------------------------------------------------------------ */
  // 과제 수정
  @ApiOperation({
    summary: '과제 수정',
    description:
      '관리자가 확인 후 부적절한 과제물 내용 수정, 텍스트만 수정 가능',
  })
  @ResponseMessage(RES_MSG.TASK_UPDATE)
  @Put('task')
  async taskUpdate(
    @Body() dto: UpdateTaskAdminDto,
    @UserPayload() user: UserDto,
  ) {
    return await this.taskService.taskUpdateByAdmin(dto, user);
  }

  @ApiOperation({ summary: '과제 제출 관리' })
  @Get('attendance')
  async attendanceList(@Query() query: AttendanceSearchDto) {
    return await this.classService.attendanceList(query);
  }

  /* 학기 ------------------------------------------------------------------------------------ */
  // 학기 마감
  @ApiOperation({
    summary: '학기 마감',
    description: 'isYearEnd === true ? 연도 마감 & 학기 초기화 : 학기 + 1',
  })
  @ResponseMessage(RES_MSG.SEMESTER_END)
  @Post('semester/end')
  async semesterEnd(@Body() dto: SemesterEndDto) {
    return await this.classService.semesterEnd(dto);
  }

  // 과제 상세
  @ApiOperation({
    summary: '과제 상세',
  })
  @ResponseMessage(RES_MSG.TASK_DETAIL)
  @Get('task/:id')
  async getTaskDetail(@Param() param: IdDto) {
    return await this.taskService.taskDetail(param.id, true);
  }

  // 과제 마감
  @isPublic()
  @ApiExcludeEndpoint()
  // 매일 자정
  @Cron('0 0 0 * * *', { name: 'classDeadline' })
  @Get('class/deadline')
  async classDeadline() {
    return await this.classService.classDeadline();
  }
}
