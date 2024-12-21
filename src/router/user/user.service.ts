import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IdDto } from 'src/common/dto/common.dto';
import { AuthorNameEntity } from 'src/entity/authorName.entity';
import { ClosureDepartment } from 'src/entity/closureDepartment.entity';
import { DepartmentEntity } from 'src/entity/department.entity';
import { EmploymentLevelEntity } from 'src/entity/employmentLevel.entity';
import { JobPositionEntity } from 'src/entity/position.entity';
import { UserEntity } from 'src/entity/user.entity';
import { Repository } from 'typeorm';
import { UpdateAuthorNameDto } from './dto/updateAuthorName.dto';
import { UserDto } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,

    @InjectRepository(ClosureDepartment)
    private readonly closureDepartmentRepository: Repository<ClosureDepartment>,

    @InjectRepository(AuthorNameEntity)
    private readonly authorNameRepository: Repository<AuthorNameEntity>,
  ) {}

  async getUserList(dto?: IdDto) {
    const queryBuilder = this.userRepository
      .createQueryBuilder('u')
      .select([
        'u.id AS id',
        'u.name AS name',
        'u.email AS email',
        'u.employmentStatus AS employmentStatus',
        'd.name AS department',
        'e.name AS employmentLevel',
        'p.name AS jobPosition ',
      ])
      .leftJoin(EmploymentLevelEntity, 'e', 'u.employmentLevelId = e.id')
      .leftJoin(DepartmentEntity, 'd', 'u.deptId = d.id')
      .leftJoin(JobPositionEntity, 'p', 'u.positionId = p.id');

    if (dto.id) {
      queryBuilder.where('u.id = :id', { id: dto.id });
    }
    return await queryBuilder.getRawMany();
  }

  async getUserByEmail(email: string) {
    const user = await this.userRepository
      .createQueryBuilder('u')
      .select([
        'u.id AS id',
        'u.name AS name',
        'u.email AS email',
        'u.employmentStatus AS employmentStatus',
      ])
      .where('u.email = :email', { email: email })
      .getRawOne();

    if (
      user.email.split('@')[1] !== 'fig.xyz' ||
      user.employmentStatus !== 'Y' ||
      !user
    ) {
      return false;
    }

    return user;
  }

  async updateAuthorName(dto: UpdateAuthorNameDto, user: UserDto) {
    // 중복되는 필명 확인
    const queryBuilder = this.authorNameRepository
      .createQueryBuilder('a')

      .select(['COUNT(a.userId) > 0 AS isDuplicate'])
      .addSelect(
        (sq) =>
          sq
            .select('an.user_id')
            .from(AuthorNameEntity, 'an')
            .where(`an.user_id = ${user.userId}`),
        'isExist',
      )
      .where('a.authorName = :authorName', { authorName: dto.authorName });

    // authorName 테이블에 userId 가 존재하는지 확인

    const authorNameValidate = await queryBuilder.getRawOne();

    if (!authorNameValidate) {
      await this.authorNameRepository.insert({
        userId: user.userId,
        authorName: dto.authorName,
      });
      return;
    }

    if (Boolean(Number(authorNameValidate.isDuplicate))) {
      throw new ConflictException('이미 존재하는 필명입니다.');
    }

    // authorName 테이블에 userId가 존재하면 update, 없으면 insert
    if (!authorNameValidate.isExist) {
      await this.authorNameRepository.insert({
        userId: user.userId,
        authorName: dto.authorName,
      });
      return;
    }

    await this.authorNameRepository.update(
      { userId: user.userId },
      {
        authorName: dto.authorName,
      },
    );
  }
}
