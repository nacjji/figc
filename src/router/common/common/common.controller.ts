import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RES_MSG } from 'src/common/constant/response.constant';
import { ResponseMessage } from 'src/common/decorator/response.decorator';
import { CommonService } from './common.service';

@ApiTags('Common')
@Controller('common')
export class CommonController {
  constructor(private readonly commonService: CommonService) {}

  @ApiOperation({ summary: '모듈 명 list' })
  @ApiResponse({ status: 200, description: RES_MSG.MODULE_SEARCH_NAME })
  @ResponseMessage(RES_MSG.MODULE_SEARCH_NAME)
  @Get('/module-name')
  async getModuleSearchName() {
    return this.commonService.getModuleSearchName();
  }

  @ApiOperation({ summary: '강사 리스트 불러오기' })
  @ApiResponse({ status: 200, description: RES_MSG.INSTRUCTOR_SEARCH_NAME })
  @ResponseMessage(RES_MSG.INSTRUCTOR_SEARCH_NAME)
  @Get('/instructor-name')
  async getInstructorSearchName() {
    return await this.commonService.getInstructorSearchName();
  }

  @ApiOperation({ summary: 'code 불러오기' })
  @ApiResponse({ status: 200, description: RES_MSG.CODE_SEARCH_NAME })
  @ResponseMessage(RES_MSG.CODE_SEARCH_NAME)
  @Get('/code-name')
  async getCodeSearchName() {
    return await this.commonService.getCodeSearchName();
  }

  @ApiOperation({
    summary: '부문 불러오기',
    description: '셀렉트 박스를 위한 부문 리스트',
  })
  @Get('/division-name')
  async getDivisionSearchName() {
    return await this.commonService.getDivision();
  }
}
