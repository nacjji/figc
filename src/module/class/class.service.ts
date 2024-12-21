import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { IdDto } from 'src/common/dto/common.dto';
import { dataSource } from 'src/config/data-source.config';
import { AuthorNameEntity } from 'src/entity/authorName.entity';
import { ClassEntity } from 'src/entity/class.entity';
import { DepartmentEntity } from 'src/entity/department.entity';
import { FigcConfigEntity } from 'src/entity/figcConfig.entity';
import { FigcFileEntity } from 'src/entity/figcFile.entity';
import { InstructorEntity } from 'src/entity/instructor.entity';
import { ModuleEntity } from 'src/entity/module.entity';
import { TaskEntity } from 'src/entity/task.entity';
import { UserEntity } from 'src/entity/user.entity';
import { CreateClassDto } from 'src/module/class/dto/createClass.dto';
import { FileUploadedData } from 'src/module/multer-config/multer-config.service';
import { SemesterEndDto } from 'src/router/admin/dto/semesterEnd.dto';
import { UserDto } from 'src/router/user/dto/user.dto';
import { Brackets, EntityManager } from 'typeorm';
import { AttendanceSearchDto } from './dto/attendanceSearch.dto';
import { ClassListDto } from './dto/classList.dto';
import { ClassListClientDto } from './dto/classListClient.dto';
import { UpdateClassDto } from './dto/updateClass.dto';

@Injectable()
export class ClassService {
  constructor(
    @InjectEntityManager(dataSource)
    private readonly entityManager: EntityManager,
  ) {}

  private async classValidation(classId?: number, dto?) {
    const queryBuilder = this.entityManager
      .createQueryBuilder(ClassEntity, 'c')
      .select(['c.id']);

    if (classId) {
      queryBuilder.where('c.id = :classId', { classId: classId });
    }

    if (dto && dto.year) {
      queryBuilder.andWhere('c.year = :year', { year: dto.year });
    }

    if (dto && dto.sequence) {
      queryBuilder.andWhere('c.sequence = :sequence', {
        sequence: dto.sequence,
      });
    }

    return await queryBuilder.getRawOne();
  }

  // 강의 등록
  async createClass(
    document: FileUploadedData[],
    dto: CreateClassDto,
    user: UserDto,
  ) {
    let result = null;
    await this.entityManager.transaction(async (manager) => {
      const queryBuilder = manager
        .createQueryBuilder(InstructorEntity, 'i')
        .select(['i.id AS id']);

      if (dto.instructorId) {
        queryBuilder.andWhere('i.id = :instructorId', {
          instructorId: dto.instructorId,
        });
      }
      const instructorValidate = await queryBuilder.getRawOne();
      if (!instructorValidate && dto.instructorId) {
        throw new BadRequestException('존재하지 않는 강사입니다.');
      }

      // 이전에 등록한 module이 아니라면 figc_module 테이블에 등록
      if (!dto.moduleId) {
        dto.moduleId = await manager
          .save(ModuleEntity, {
            name: dto.moduleName,
          })
          .then((res) => res.id);
      }

      await manager
        .createQueryBuilder(FigcConfigEntity, 'c')
        .update(FigcConfigEntity)
        .set({ currentSequence: () => 'currentSequence + 1' })
        .execute();

      let documentFileId = null;
      // let coverFileId = null;

      if (document) {
        documentFileId = await manager
          .save(FigcFileEntity, {
            fileOriginName: document[0].originalname,
            fileTransedName: document[0].fileTransedName,
            extension: document[0].extension,
          })
          .then((res) => res.fileId);
      }

      const getConfig = await manager
        .createQueryBuilder(FigcConfigEntity, 'c')
        .select([
          'c.currentYear AS year',
          'c.currentSemester AS semester',
          'c.currentSequence AS sequence',
        ])
        .getRawOne();

      result = await manager
        .save(ClassEntity, {
          ...dto,
          adminId: user.userId,
          year: getConfig.year,
          semester: getConfig.semester,
          sequence: getConfig.sequence,
          documentId: documentFileId,
        })
        .then((res) => res.id);
    });
    return result;
  }

  async classList(filter: ClassListDto | ClassListClientDto) {
    const queryBuilder = this.entityManager
      .createQueryBuilder(ClassEntity, 'c')
      .leftJoin(InstructorEntity, 'i', 'i.id = c.instructorId')
      .leftJoin(FigcFileEntity, 'fd', 'fd.fileId = c.documentId')
      .leftJoin(ModuleEntity, 'm', 'm.id = c.moduleId')
      .where(
        new Brackets((sq) => {
          if (filter.moduleId) {
            sq.andWhere('c.moduleId = :moduleId', {
              moduleId: filter.moduleId,
            });
          }

          if (filter.instructorId) {
            sq.andWhere('c.instructorId = :instructorId', {
              instructorId: filter.instructorId,
            });
          }
        }),
      )
      .orderBy('c.year', 'DESC')
      .addOrderBy('c.sequence', 'DESC')
      .addOrderBy('c.createdAt', 'DESC');

    // classId
    if ('id' in filter && filter.id) {
      const classValidation = await this.classValidation(filter.id, null);

      if (!classValidation)
        throw new BadRequestException('존재하지 않는 강의입니다.');

      // prevClassId nextClassId 추가
      queryBuilder
        .select([
          'c.id AS classId',
          'c.status AS status',
          'c.isPrivate AS isPrivate',
          'c.title AS title',
          'i.instructorName AS instructor',
          'm.name AS moduleName',
          'c.end_date - INTERVAL 6 DAY AS startDate',
          'c.endDate AS endDate',
          'c.year AS year',
          'c.semester AS semester',
          'c.sequence AS sequence',
          'c.videoUrl AS videoUrl',
          'c.createdAt AS createdAt',
        ])
        .addSelect(
          (sq) =>
            sq
              .select('c.id')
              .from(ClassEntity, 'c')
              .where('c.id < :classId', { classId: filter.id })
              .orderBy('c.id', 'DESC')
              .limit(1),
          'prev',
        )
        .addSelect(
          (sq) =>
            sq
              .select('c.id')
              .from(ClassEntity, 'c')
              .where('c.id > :classId', { classId: filter.id })
              .orderBy('c.id', 'ASC')
              .limit(1),
          'next',
        );

      return await queryBuilder
        .where('c.id =:classId', { classId: filter.id })
        .getRawOne();
    } else {
      const totalCount = await queryBuilder
        .select(['COUNT(*) AS totalCount'])
        .getRawOne();

      if (filter.page || filter.per) {
        queryBuilder.offset(filter.per * (filter.page - 1)).limit(filter.per);
      }

      const list = await queryBuilder
        .select([
          'c.id AS classId',
          'c.status AS status',
          'c.title AS title',
          'i.instructorName AS instructor',
          'm.name AS moduleName',
          'c.end_date - INTERVAL 6 DAY AS startDate',
          'c.endDate AS endDate',
          'c.year AS year',
          'c.semester AS semester',
          'c.sequence AS sequence',
          'c.videoUrl AS videoUrl',
          'c.createdAt AS createdAt',
        ])
        .getRawMany();

      return {
        list,
        totalCount: Number(totalCount.totalCount),
      };
    }
  }

  // 회차 불러오기
  async getSequence() {
    const queryBuilder = this.entityManager
      .createQueryBuilder(ClassEntity, 'c')
      .select([
        'c.id AS id',
        'c.status AS status',
        `CONCAT(c.year, "-", c.semester, "-" , LPAD(c.sequence, 3, '0')) AS sequence`,
        'c.title AS title',
      ])
      .where('c.status =:status', { status: 'E' })
      .andWhere('c.endDate IS NOT NULL')
      .orderBy('c.year', 'DESC')
      .addOrderBy('c.sequence', 'DESC')
      .getRawMany();

    return await queryBuilder;
  }

  // 출석관리(admin)
  async attendanceList(dto: AttendanceSearchDto) {
    const userSubQuery = this.entityManager
      .createQueryBuilder(UserEntity, 'u')
      .subQuery()
      .select(['u.id AS userId', 'u.name AS name', 'u.deptId AS deptId'])
      .from(UserEntity, 'u')
      .where('u.employmentStatus = "Y"')
      .getQuery();

    const queryBuilder = this.entityManager
      .createQueryBuilder(ClassEntity, 'c')
      .select([
        't.id AS taskId',
        `CASE WHEN t.id IS NOT NULL THEN "Y" ELSE "N" END AS isSubmit`,
        'c.year AS year',
        'c.semester AS semester',
        'c.sequence AS sequence',
        'c.title AS title',
        'u.name AS userName',
        'an.authorName AS authorName',
        'IFNULL(dp.name, d.name) AS division',
        `t.likeCnt AS likeCount`,
        't.createdAt AS createdAt',
      ])
      .leftJoin(userSubQuery, 'u', '1=1')
      .leftJoin(TaskEntity, 't', 't.user_id = u.userId AND t.classId = c.id')
      .leftJoin(AuthorNameEntity, 'an', 'an.userId = u.userId')
      .leftJoin(DepartmentEntity, 'd', 'd.id = u.deptId')
      .leftJoin(
        'department',
        'dp',
        `dp.id = (
          SELECT parent_id 
          FROM closure_department 
          WHERE child_id = u.deptId 
          ORDER BY (
            CASE 
              WHEN parent_id = 1 THEN 2
              ELSE 1
            END
          ), parent_id ASC
          LIMIT 1
        )`,
      )
      .where('c.id = :id', { id: dto.id })
      .andWhere('c.endDate IS NOT NULL')
      .andWhere(
        new Brackets((sq) => {
          sq.where(
            `CASE WHEN c.status = "I" THEN t.id IS NOT NULL ELSE 1=1 END`,
          );
        }),
      )

      .orderBy('isSubmit', 'ASC')
      .addOrderBy('t.likeCnt', 'DESC');

    if (dto.isSubmit === 'Y') {
      queryBuilder.andWhere('t.id IS NOT NULL');
    } else if (dto.isSubmit === 'N') {
      queryBuilder.andWhere('t.id IS NULL');
    }

    if (dto.division) {
      queryBuilder.andWhere('dp.id = :division', { division: dto.division });
    }

    const list = await queryBuilder.getRawMany();

    const summary = await this.entityManager
      .createQueryBuilder(UserEntity, 'u')
      .select(['COUNT(*) AS totalCount'])

      .addSelect(
        (sq) =>
          sq
            .select('COUNT(t.id)')
            .from(TaskEntity, 't')
            .leftJoin(ClassEntity, 'c', 'c.id = t.class_id')
            .where('t.id IS NOT NULL AND c.id = :id', { id: dto.id }),
        'submitCount',
      )

      .where('u.employmentStatus = "Y"')
      .getRawOne();

    return {
      summary: {
        totalCount: Number(summary.totalCount),
        submitCount: Number(summary.submitCount),
        notSubmitCount:
          Number(summary.totalCount) - Number(summary.submitCount),
      },
      list,
    };
  }

  async classDetail(id: IdDto, user: UserDto) {
    const classValidation = await this.classValidation(id.id, null);
    if (!classValidation) {
      throw new BadRequestException('존재하지 않는 강의입니다.');
    }
    const queryBuilder = this.entityManager
      .createQueryBuilder(ClassEntity, 'c')
      .select([
        'c.id AS id',
        'c.status AS status',
        'c.year AS year',
        'c.semester AS semester',
        'c.sequence AS sequence',
        'c.title AS title',
        'c.question AS question',
        'c.description AS description',
        'i.instructorName AS instructor',
        'i.instructorEmail AS instructorEmail',
        'i.instructorIntroduce AS introduce',
        'i.instructorInstagram AS instagram',
        'i.homepage AS homepage',
        'm.name AS moduleName',
        'c.end_date - INTERVAL 6 DAY AS startDate',
        'c.endDate AS endDate',
        'c.taskType AS taskType',
        'c.videoUrl AS videoUrl',
        `CONCAT("${process.env.S3_CLASS_PATH}/", fc.fileTransedName) AS documentUrl`,
        'fc.fileOriginName AS fileOriginName',
        'a.authorName AS authorName',
        't.id AS taskId',
        'c.created_at AS createdAt',
        'c.introduction AS introduction',
      ])
      .leftJoin(FigcFileEntity, 'fc', 'fc.fileId = c.documentId')
      .leftJoin(AuthorNameEntity, 'a', `a.userId = ${user.userId}`)
      .leftJoin(InstructorEntity, 'i', 'i.id = c.instructorId')
      .leftJoin(ModuleEntity, 'm', 'm.id = c.moduleId')
      .leftJoin(
        TaskEntity,
        't',
        `c.id = t.class_id AND t.user_id = ${user.userId}`,
      );

    if (id.id) {
      return await queryBuilder.where('c.id = :id', { id: id.id }).getRawOne();
    } else {
      const getConfig = await this.entityManager
        .createQueryBuilder(FigcConfigEntity, 'c')
        .select([
          'c.currentYear AS year',
          'c.currentSemester AS semester',
          'c.currentSequence AS sequence',
        ])
        .getRawOne();

      return await queryBuilder
        .where(`c.year = ${getConfig.year}`)
        .andWhere(`c.semester = ${getConfig.semester}`)
        .andWhere(`c.sequence = ${getConfig.sequence}`)
        .getRawOne();
    }
  }

  async classDeadline() {
    // 2024-04-18 00:00:00
    const target = await this.entityManager
      .createQueryBuilder(ClassEntity, 'c')
      .select(['c.id AS id'])
      .where('c.status = :status', { status: 'I' })
      .andWhere(`c.endDate < CURDATE()`)
      .getRawMany()
      .then((res) => res.map((r) => r.id));

    if (target.length > 0) {
      // 배열 내에 있는 id status 모두 E로 변경

      await this.entityManager.update(ClassEntity, target, { status: 'E' });
    }
  }

  async classUpdate(document: FileUploadedData[], dto: UpdateClassDto) {
    const classValidationQueryBuilder = this.entityManager
      .createQueryBuilder(ClassEntity, 'c')
      .select(['c.id'])
      .addSelect(
        (sq) =>
          sq
            .select('i.id')
            .from(InstructorEntity, 'i')
            .where('i.id = :instructorId', { instructorId: dto.instructorId }),
        'instructorId',
      )
      .where('c.id = :id', { id: dto.id });

    const classValidation = await classValidationQueryBuilder.getRawOne();

    if (!classValidation) {
      throw new BadRequestException('존재하지 않는 강의입니다.');
    }
    if (!classValidation.instructorId) {
      throw new BadRequestException('존재하지 않는 강사입니다.');
    }

    await this.entityManager.transaction(async (manager) => {
      // dto.moduleName 이 있으면 새로운 모듈 등록
      if (dto.moduleName) {
        dto.moduleId = await manager
          .save(ModuleEntity, {
            name: dto.moduleName,
          })
          .then((res) => res.id);
      }
      // document가 있으면 file 테이블에 등록 후 dto.documentId에 저장
      let documentFileId = null;
      if (document) {
        documentFileId = await manager
          .save(FigcFileEntity, {
            fileOriginName: document[0].originalname,
            fileTransedName: document[0].fileTransedName,
            extension: document[0].extension,
          })
          .then((res) => res.fileId);
      }

      await manager.update(ClassEntity, dto.id, {
        moduleId: dto.moduleId,
        title: dto.title,
        instructorId: dto.instructorId,
        videoUrl: dto.videoUrl,
        documentId: documentFileId,
        question: dto.question,
        endDate: dto.endDate,
        introduction: dto.introduction,
        description: dto.description,
        taskType: dto.taskType,
      });
    });
  }

  async semesterEnd(dto: SemesterEndDto) {
    if (dto.isYearEnd) {
      await this.entityManager.update(
        FigcConfigEntity,
        {},
        {
          currentYear: () => 'currentYear + 1',
          currentSemester: 1,
        },
      );
    } else {
      await this.entityManager.update(
        FigcConfigEntity,
        {},
        {
          currentSemester: () => 'currentSemester + 1',
        },
      );
    }
  }
}
