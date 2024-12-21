import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { IdDto } from 'src/common/dto/common.dto';
import { PageParamDto } from 'src/common/dto/pageParam.dto';
import { dataSource } from 'src/config/data-source.config';
import { ClassEntity } from 'src/entity/class.entity';
import { FigcConfigEntity } from 'src/entity/figcConfig.entity';
import { InstructorEntity } from 'src/entity/instructor.entity';
import { ModuleEntity } from 'src/entity/module.entity';
import { EntityManager, Repository } from 'typeorm';
import { CreateInstructorDto } from './dto/instructorCreate.dto';
import { UpdateInstructorDto } from './dto/instructorUpdate.dto';

@Injectable()
export class InstructorService {
  constructor(
    @InjectRepository(InstructorEntity)
    private readonly instructorRepository: Repository<InstructorEntity>,

    @InjectEntityManager(dataSource)
    private readonly entityManager: EntityManager,
  ) {}

  // 강사 등록
  async createInstructor(data: CreateInstructorDto) {
    return await this.instructorRepository
      .save({
        instructorName: data.name,
        instructorEmail: data.email,
        instructorIntroduce: data.introduction,
        instructorPhone: data.phoneNumber,
        instructorInstagram: data.instagram,
        homepage: data.homepage,
      })
      .then((result) => result.id);
  }

  // 강사 리스트 조회
  async getInstructorList(filter: PageParamDto) {
    if (!filter.page || !filter.per)
      throw new BadRequestException('page, per를 입력해주세요.');

    return {
      totalCount: await this.instructorRepository.count(),
      list: await this.instructorRepository
        .createQueryBuilder('i')
        .select([
          'i.id AS id',
          'i.instructorName AS name',
          'i.instructorEmail AS email',
          'i.instructorPhone AS phoneNumber',
          'i.instructorIntroduce AS introduction',
          'i.createdAt AS createdAt',
        ])
        .orderBy('i.instructorName', 'ASC')
        .offset(filter.per * (filter.page - 1))
        .limit(filter.per)
        .getRawMany(),
    };
  }

  async getInstructorDetail(id: IdDto) {
    const instructorValidate = await this.entityManager
      .createQueryBuilder(InstructorEntity, 'i')
      .select('i.id')
      .where('i.id = :id', { id: id.id })
      .getRawOne();

    if (!instructorValidate) {
      throw new BadRequestException('존재하지 않는 강사입니다.');
    }
    const classSubQuery = this.entityManager
      .createQueryBuilder()
      .subQuery()
      .select([
        'c.instructorId AS instructorId',
        `JSON_ARRAYAGG(
          JSON_OBJECT(
            'classId', c.id,
            'year', c.year,
            'semester', c.semester,
            'sequence', c.sequence,
            'moduleName', m.name,
            'title', c.title,
            'createdAt', c.createdAt
          )
        ) AS class`,
      ])
      .from(
        this.entityManager
          .createQueryBuilder()
          .subQuery()
          .select([
            'cc.instructor_id AS instructorId',
            'cc.id AS id',
            'cc.year AS year',
            'cc.semester AS semester',
            'cc.sequence AS sequence',
            'cc.title AS title',
            'cc.created_at AS createdAt',
            'cc.module_id AS moduleId',
          ])
          .from(ClassEntity, 'cc')
          .getQuery(),
        'c',
      )
      .leftJoin(ModuleEntity, 'm', 'c.moduleId = m.id')
      .groupBy('c.instructorId')
      .getQuery();

    const queryBuilder = this.instructorRepository
      .createQueryBuilder('i')
      .select([
        'i.id AS id',
        'i.instructorName AS name',
        'i.instructorEmail AS email',
        'i.instructorPhone AS phoneNumber',
        'i.instructorInstagram AS instagram',
        'i.homepage AS homepage',
        'i.instructorIntroduce AS introduction',
        'i.createdAt AS createdAt',
        'c.class',
      ])
      .leftJoin(classSubQuery, 'c', 'c.instructorId = i.id')
      .where('i.id = :id', { id: id.id });

    const detail = await queryBuilder.getRawOne();

    if (detail && detail.class && detail.class.length > 0) {
      detail.class = detail.class.sort((a, b) => {
        if (a.classId > b.classId) return -1;
        else if (a.classId < b.classId) return 1;
        else 0;
      });
    } else {
      detail.class = [];
    }
    return detail;
  }

  async getInstructorBySemester() {
    const getConfig = await this.entityManager
      .createQueryBuilder(FigcConfigEntity, 'fc')
      .select(['fc.currentYear AS year', 'fc.currentSemester AS semester'])
      .getRawOne();

    const queryBuilder = this.entityManager
      .createQueryBuilder(ClassEntity, 'c')
      .select(['i.id AS value', 'i.instructorName AS name'])
      .leftJoin(InstructorEntity, 'i', 'i.id = c.instructorId')
      .groupBy('i.id');

    return queryBuilder
      .where('c.semester = :semester', {
        semester: getConfig.semester,
      })
      .andWhere('c.year = :year', {
        year: getConfig.year,
      })
      .getRawMany();
  }

  // 수정
  async updateInstructor(data: UpdateInstructorDto) {
    const result = await this.instructorRepository.update(data.id, {
      instructorName: data.name,
      instructorEmail: data.email,
      instructorIntroduce: data.introduction,
      instructorPhone: data.phoneNumber,
      instructorInstagram: data.instagram,
      homepage: data.homepage,
    });

    if (!result.affected) {
      throw new BadRequestException('존재하지 않는 강사입니다.');
    }
  }
}
