import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectEntityManager } from '@nestjs/typeorm';
import { JwtExpiredException } from 'src/common/exception/jwt.exception';
import { JwtPayload } from 'src/common/interface/jwtPayload.interface';
import { dataSource } from 'src/config/data-source.config';
import { AdminListEntity } from 'src/entity/adminList.entity';
import { AuthorNameEntity } from 'src/entity/authorName.entity';
import { UserEntity } from 'src/entity/user.entity';
import { EntityManager } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectEntityManager(dataSource)
    private readonly entityManager: EntityManager,
  ) {}

  // jwt sign을 이용해 토큰을 생성
  getAccessToken(payload: JwtPayload, role: string) {
    try {
      delete payload.iat;
      delete payload.exp;
      return this.jwtService.sign(
        { ...payload, type: 'access' },
        {
          expiresIn: '12h',
          secret:
            role === 'user'
              ? process.env.JWT_SECRET
              : process.env.ADMIN_JWT_SECRET,
        },
      );
    } catch (error) {
      throw new InternalServerErrorException('generate token failed');
    }
  }

  getRefreshToken(payload: JwtPayload, role: string) {
    try {
      return this.jwtService.sign(
        { ...payload, type: 'refresh' },
        {
          expiresIn: '7d',
          secret:
            role === 'user'
              ? process.env.JWT_SECRET
              : process.env.ADMIN_JWT_SECRET,
        },
      );
    } catch (error) {
      throw new InternalServerErrorException('generate token failed');
    }
  }

  getTokenPayload(token: string, role: string): JwtPayload {
    try {
      return this.jwtService.verify(token, {
        secret:
          role === 'user'
            ? process.env.JWT_SECRET
            : process.env.ADMIN_JWT_SECRET,
      });
    } catch (error) {
      if (error.message === 'jwt expired') {
        throw new JwtExpiredException();
      }
      throw new UnauthorizedException('invalid token');
    }
  }

  async getPingData(userId: number) {
    const authorNameSubQuery = this.entityManager
      .createQueryBuilder()
      .subQuery()
      .select(['an.userId AS userId', 'an.authorName AS authorName'])
      .from(AuthorNameEntity, 'an')
      .leftJoin(UserEntity, 'u', 'u.id = an.userId')
      .where('an.user_id= :userId', { userId })
      .getQuery();

    const adminListSubQuery = this.entityManager
      .createQueryBuilder()
      .subQuery()
      .select('a.userId AS userId')
      .from(AdminListEntity, 'a')
      .where('a.userId = :userId', { userId })
      .getQuery();

    const queryBuilder = this.entityManager
      .createQueryBuilder(UserEntity, 'u')
      .select([
        'u.id AS userId',
        'IFNULL(an.authorName, u.name) AS authorName',
        'COUNT(a.userId) > 0 AS isAdmin',
      ])
      .leftJoin(authorNameSubQuery, 'an', 'u.id = an.userId')
      .leftJoin(adminListSubQuery, 'a', 'u.id = a.userId')
      .where('u.id = :userId', { userId });

    const result = await queryBuilder.getRawOne();
    result.isAdmin = Boolean(Number(result.isAdmin));
    return result;
  }
}
