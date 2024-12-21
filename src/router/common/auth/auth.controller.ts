import {
  Controller,
  Get,
  HttpException,
  Post,
  Redirect,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiExcludeEndpoint,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { RES_MSG } from 'src/common/constant/response.constant';
import { isPublic } from 'src/common/decorator/public.decorator';
import { ResponseMessage } from 'src/common/decorator/response.decorator';
import {
  AccessToken,
  RefreshToken,
} from 'src/common/decorator/token.decorator';
import {
  InvalidTokenTypeException,
  JwtExpiredException,
} from 'src/common/exception/jwt.exception';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import { GoogleUser } from 'src/common/interface/googleUser.interface';
import { UserService } from 'src/router/user/user.service';
import { AuthService } from './auth.service';

@UseGuards(JwtAuthGuard)
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  // 구글 인증 화면
  @ApiExcludeEndpoint()
  @Get('google')
  @isPublic()
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  // 구글 로그인 리다이렉트
  @ApiExcludeEndpoint()
  @Get('google/callback')
  @isPublic()
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const user = req.user as GoogleUser;

      // 로그인 검증
      const userData = await this.userService.getUserByEmail(user.email);

      // jwt payload
      const payload = {
        userId: userData.id,
        name: userData.name,
        email: userData.email,
      };

      // jwt sign을 이용해 토큰 생성
      const accessToken = this.authService.getAccessToken(payload, 'user');
      const refreshToken = this.authService.getRefreshToken(payload, 'user');
      // redirect url에 토큰을 파라미터로 붙여서 리다이렉트
      return res.redirect(
        `${process.env.CALLBACK_URL}/google-oauth-success-redirect?access=${accessToken}&refresh=${refreshToken}`,
      );
    } catch (error) {
      throw new HttpException('login fail', 497);
    }
  }

  @Redirect(`${process.env.CALLBACK_URL}/google-oauth-fail-redirect`)
  @isPublic()
  @ApiExcludeEndpoint()
  @Get('google/fail')
  async googleAuthFailCallback() {}

  // login 상태를 지속적으로 확인하는 ping api -- user
  @ApiOperation({ summary: '로그인 상태 확인' })
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 200, description: '로그인 상태 확인' })
  @ResponseMessage(RES_MSG.PING_SUCCESS)
  @UseGuards(JwtAuthGuard)
  @Get('ping')
  async ping(@AccessToken() access: string) {
    const accessToken = access;

    try {
      const payload = this.authService.getTokenPayload(accessToken, 'user');
      if (payload.type !== 'access') {
        throw new UnauthorizedException();
      }

      const getPingData = await this.authService.getPingData(payload.userId);

      return {
        id: payload.userId,
        userName: payload.name,
        email: payload.email,
        isAdmin: getPingData.isAdmin,
        authorName: getPingData.authorName,
      };
    } catch (error) {
      throw new UnauthorizedException(`로그인 상태가 아닙니다. : ${error}`);
    }
  }

  @ApiOperation({ summary: '토큰 갱신' })
  @ApiBearerAuth('access-token')
  @Post('refresh')
  async refreshAccessToken(@RefreshToken() token: string) {
    try {
      const payload = this.authService.getTokenPayload(token, 'user');
      if (payload.type !== 'refresh') {
        throw new InvalidTokenTypeException();
      }

      const accessToken = this.authService.getAccessToken(
        {
          ...payload,
          type: 'access',
        },
        'user',
      );

      return { accessToken };
    } catch (error) {
      if (error.message === 'jwt expired') {
        throw new JwtExpiredException();
      }
      throw new UnauthorizedException('AccessToken 재발급 실패');
    }
  }
}
