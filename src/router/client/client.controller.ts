import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RES_MSG } from 'src/common/constant/response.constant';
import { isPublic } from 'src/common/decorator/public.decorator';
import { ResponseMessage } from 'src/common/decorator/response.decorator';
import { IdDto } from 'src/common/dto/common.dto';
import { ClassService } from 'src/module/class/class.service';
import { ClassListClientDto } from 'src/module/class/dto/classListClient.dto';
import { TaskListDto } from 'src/module/task/dto/taskList.dto';
import { TaskService } from 'src/module/task/task.service';

@isPublic()
@ApiTags('Client')
@Controller('client')
export class ClientController {
  constructor(
    private readonly taskService: TaskService,
    private readonly classService: ClassService,
  ) {}

  @ApiOperation({
    summary: '과제 리스트 불러오기',
    description:
      '과제 리스트를 불러옵니다. id값은 userId입니다. 홈화면에서 사용합니다.',
  })
  @ResponseMessage(RES_MSG.TASK_LIST)
  @Get('/task')
  async taskList(@Query() query: TaskListDto) {
    return await this.taskService.taskList(query);
  }

  @ApiOperation({
    summary: '강의 회차 불러오기',
    description: 'status B : 대기, I : 진행중 : E : 종료',
  })
  @Get('class/sequence')
  async getSequence() {
    return await this.classService.getSequence();
  }

  @ApiOperation({ summary: '과제 좋아요' })
  @ResponseMessage(RES_MSG.TASK_LIKE)
  @isPublic()
  @Post('task/like')
  async likeTask(@Body() dto: IdDto) {
    return await this.taskService.likeTask(dto);
  }

  @ApiOperation({
    summary: '강의 리스트 불러오기',
    description: '강의 리스트를 불러옵니다. id값은 classId입니다.',
  })
  @Get('class')
  async classList(@Query() query: ClassListClientDto) {
    const result = await this.classService.classList(query);

    return query.id ? result : result.list;
  }
}
