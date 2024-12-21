import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import * as dayjs from 'dayjs';
import { IdDto } from 'src/common/dto/common.dto';
import { dataSource } from 'src/config/data-source.config';
import { AuthorNameEntity } from 'src/entity/authorName.entity';
import { ClassEntity } from 'src/entity/class.entity';
import { DepartmentEntity } from 'src/entity/department.entity';
import { FigcFileEntity } from 'src/entity/figcFile.entity';
import { InstructorEntity } from 'src/entity/instructor.entity';
import { ModuleEntity } from 'src/entity/module.entity';
import { TaskEntity } from 'src/entity/task.entity';
import { TaskFileRelationEntity } from 'src/entity/taskFileRelation.entity';
import { TaskUpdateLogEntity } from 'src/entity/taskUpdateLog.entity';
import { UserEntity } from 'src/entity/user.entity';
import { AssignmentFilterDto } from 'src/router/user/dto/assignmentFilter.dto';
import { CreateTaskDto } from 'src/router/user/dto/createTask.dto';
import { UserDto } from 'src/router/user/dto/user.dto';
import { Brackets, EntityManager } from 'typeorm';
import { FileUploadedData } from '../multer-config/multer-config.service';
import { TaskListDto } from './dto/taskList.dto';
import { UpdateTaskDto } from './dto/updateTask.dto';
import { UpdateTaskAdminDto } from './dto/updateTaskAdmin.dto';

@Injectable()
export class TaskService {
  constructor(
    @InjectEntityManager(dataSource)
    private readonly entityManager: EntityManager,
  ) {}

  private async classValidation(
    classId: number,
    userId: number,
    authorName?: string,
  ) {
    const queryBuilder = this.entityManager
      .createQueryBuilder(ClassEntity, 'c')
      .select([
        'c.id AS id',
        'c.createdAt AS createdAt',
        'c.end_date AS endDate',
      ])
      .addSelect(
        (sq) =>
          sq
            .select('COUNT(*) > 0 AS isExist')
            .from(TaskEntity, 't')
            .where('t.classId = c.id')
            .andWhere('t.userId = :userId', { userId }),
        'isExist',
      )
      .where('c.id = :classId', { classId });

    if (authorName) {
      // AuthorNameEntity에 필명이 있는경우 isDuplicate = true
      queryBuilder.addSelect(
        (sq) =>
          sq
            .select('a.userId')
            .from(AuthorNameEntity, 'a')
            .where('a.authorName = :authorName', { authorName })
            .andWhere('a.userId != :userId', { userId }),
        'isDuplicate',
      );
    }

    const result = await queryBuilder.getRawOne();

    result.isExist = Boolean((result.isExist = Number(result.isExist)));
    return result;
  }

  // 과제 제출
  async createTask(
    dto: CreateTaskDto,
    user: UserDto,
    file?: FileUploadedData[],
  ) {
    const classValidation = await this.classValidation(
      dto.classId,
      user.userId,
      dto.authorName,
    );

    if (!classValidation) {
      throw new BadRequestException('존재하지 않는 강의입니다.');
    }

    if (classValidation.isExist) {
      throw new ConflictException('이미 이번 회차에 과제를 제출하였습니다.');
    }

    if (dayjs().diff(dayjs(classValidation.endDate), 'day') > 0) {
      throw new BadRequestException('과제 제출 기간이 아닙니다.');
    }

    let result = null;
    await this.entityManager.transaction(async (manager) => {
      dto.authorName = dto.authorName ?? user.name;

      // 필명을 입력 했을 경우
      if (dto.authorName) {
        // 중복되는 필명이 있는지 확인
        const existingAuthorName = await manager
          .createQueryBuilder(AuthorNameEntity, 'a')
          .select(['a.userId'])
          .where('a.authorName = :authorName', { authorName: dto.authorName })
          .getOne();

        if (existingAuthorName) {
          // 중복된 필명이 본인의 필명인지 확인
          if (existingAuthorName.userId !== user.userId) {
            throw new ConflictException('이미 사용중인 필명입니다.');
          }
        } else {
          // 중복되지 않았다면 새로운 userId, authorName 생성
          await manager.delete(AuthorNameEntity, { userId: user.userId });
          await manager.save(AuthorNameEntity, {
            userId: user.userId,
            authorName: dto.authorName,
          });
        }
      } else {
        // 필명을 입력하지 않았을 경우 user.name을 사용
        dto.authorName = user.name;
      }

      const taskId = await manager
        .save(TaskEntity, { ...dto, userId: user.userId })
        .then((res) => res.id);

      result = taskId;
      const fileId = file
        ? await manager
            .save(FigcFileEntity, {
              fileOriginName: file[0].originalname,
              fileTransedName: file[0].fileTransedName,
              extension: file[0].extension,
            })
            .then((res) => res.fileId)
        : null;

      if (fileId) {
        await manager.save(TaskFileRelationEntity, {
          taskId,
          // type : 'I' |  'V'
          type: file[0].mimetype.includes('image') ? 'I' : 'V',
          fileId: fileId,
        });
      }
    });
    return result;
  }

  // 과제 리스트 불러오기
  async taskList(dto?: TaskListDto) {
    const classInfoQueryBuilder = this.entityManager
      .createQueryBuilder(ClassEntity, 'c')
      .select([
        'c.id AS id',
        'c.year AS year',
        'c.semester AS semester',
        'c.sequence AS sequence',
        'i.instructorName AS instructorName',
        'c.question AS question',
        'c.title AS title',
        'm.name AS moduleName',
      ])
      .leftJoin(InstructorEntity, 'i', 'i.id = c.instructorId')
      .leftJoin(ModuleEntity, 'm', 'm.id = c.moduleId')
      .where('c.endDate IS NOT NULL')
      .andWhere('c.status = :status', { status: 'E' })
      .orderBy('c.year', 'DESC')
      .addOrderBy('c.sequence', 'DESC')
      .limit(1);

    if (dto.sequence && dto.year) {
      classInfoQueryBuilder
        .andWhere('c.sequence = :sequence', { sequence: dto.sequence })
        .andWhere('c.year = :year', { year: dto.year });
    }
    const classInfo = await classInfoQueryBuilder.getRawOne();

    const queryBuilder = this.entityManager
      .createQueryBuilder(TaskEntity, 't')
      .select([
        't.id AS id',
        "IFNULL(tfr.type, 'T') AS fileType", // fileType이 NULL 일 경우 'T'ext 타입으로
        `CONCAT("${process.env.S3_TASK_PATH}/", f.fileTransedName) AS fileUrl`,
        'c.year AS year',
        'c.semester AS semester',
        'c.sequence AS sequence',
        'c.videoUrl AS relatedUrl',
        'u.id AS userId',
        't.likeCnt AS likeCnt',
        't.text AS text',
        'u.name AS userName',
        'c.title AS classTitle',
        't.createdAt AS createdAt',
        'a.authorName AS authorName',
      ])
      .leftJoin(AuthorNameEntity, 'a', 'a.userId = t.userId')
      .leftJoin(UserEntity, 'u', 'u.id = t.userId')
      .leftJoin(ClassEntity, 'c', 'c.id = t.classId')
      .leftJoin(TaskFileRelationEntity, 'tfr', 'tfr.taskId = t.id')
      .leftJoin(FigcFileEntity, 'f', 'f.fileId = tfr.fileId')
      .where('t.classId = :classId', { classId: classInfo.id });
    if (dto.id) {
      return queryBuilder
        .andWhere('t.userId = :id', { id: dto.id })
        .getRawMany();
    }

    // year와 sequence에 따른 조건 추가
    if (dto.year && dto.sequence) {
    }
    // 정렬 조건 추가
    queryBuilder.orderBy('RAND()');

    const list = await queryBuilder.getRawMany();
    return { classInfo, list };
  }

  async likeTask(dto: IdDto): Promise<void> {
    const queryBuilder = this.entityManager
      .createQueryBuilder(TaskEntity, 't')
      .select(['t.id'])
      .where('t.id = :taskId', { taskId: dto.id });

    const taskLikeValidate = await queryBuilder.getRawOne();
    if (!taskLikeValidate)
      throw new BadRequestException('좋아요를 누를 수 없는 과제입니다.');

    // 좋아요 증가
    await this.entityManager.update(
      TaskEntity,
      { id: dto.id },
      { likeCnt: () => 'likeCnt + 1' },
    );
  }

  // 과제 관리 summary
  async getAssignmentSummary(user: UserDto) {
    const res = await this.entityManager
      .createQueryBuilder(ClassEntity, 'c')
      .select([
        'COUNT(c.id) AS totalCnt',
        'COUNT(CASE WHEN t.id IS NOT NULL THEN 1 END) AS completeCnt',
        'COUNT(CASE WHEN t.id IS NULL AND DATE_ADD(c.end_date, INTERVAL 1 DAY) > CURDATE() THEN 1 END) AS waitCnt',
        'COUNT(CASE WHEN t.id IS NULL AND DATE_ADD(c.end_date, INTERVAL 1 DAY) < CURDATE() THEN 1 END) AS inCompleteCnt',
      ])
      .leftJoin(
        TaskEntity,
        't',
        `t.class_id = c.id AND t.user_id = ${user.userId}`,
      )
      .where('c.end_date IS NOT NULL')
      .getRawOne();

    // res number casting
    res.totalCnt = Number(res.totalCnt);
    res.completeCnt = Number(res.completeCnt);
    res.waitCnt = Number(res.waitCnt);
    res.inCompleteCnt = Number(res.inCompleteCnt);

    return res;
  }

  // 과제 관리 list
  async getAssignmentList(user: UserDto, dto: AssignmentFilterDto) {
    const query = this.entityManager
      .createQueryBuilder(ClassEntity, 'c')
      .leftJoin(ModuleEntity, 'cat', 'c.module_id = cat.id')
      .leftJoin(
        TaskEntity,
        't',
        `t.class_id = c.id AND t.user_id = ${user.userId}`,
      )
      .where(
        new Brackets((qb) => {
          qb.andWhere('c.endDate IS NOT NULL');
          if (dto.moduleId)
            qb.andWhere('c.module_id = :id', { id: dto.moduleId });

          if (dto.status) {
            switch (dto.status) {
              case 'Y':
                qb.andWhere('t.id IS NOT NULL');
                break;
              case 'W':
                qb.andWhere(
                  't.id IS NULL AND DATE_ADD(c.end_date, INTERVAL 1 DAY) > CURDATE()',
                );
                break;
              case 'N':
                qb.andWhere(
                  't.id IS NULL AND DATE_ADD(c.end_date, INTERVAL 1 DAY) < CURDATE()',
                );
                break;
              default:
                break;
            }
          }
        }),
      );

    const total = await query.select(['COUNT(*) AS cnt']).getRawOne();

    const res = await query
      .select([
        'c.id AS id',
        `CASE
          WHEN t.id IS NOT NULL THEN 'Y'
          WHEN t.id IS NULL AND DATE_ADD(c.end_date, INTERVAL 1 DAY) > CURDATE() THEN 'W'
          ELSE 'N'
        END AS status
        `,
        'c.year AS year',
        'c.semester AS semester',
        'c.sequence AS sequence',
        'cat.name AS moduleName',
        'c.question AS question',
        'c.end_date - INTERVAL 6 DAY AS startDate',
        'c.end_date AS endDate',
        't.id AS taskId',
        't.created_at AS submitDate',
      ])
      .orderBy('c.year', 'DESC')
      .addOrderBy('c.sequence', 'DESC')
      .limit(dto.per)
      .offset(dto.per * (dto.page - 1))
      .getRawMany();

    return {
      totalCount: Number(total.cnt),
      list: res,
    };
  }
  /**
   * @description 과제 수정
   * @param IdDto
   */
  async updateTask(
    dto: UpdateTaskDto,
    file: FileUploadedData[],
    user: UserDto,
  ) {
    // validation
    const queryBuilder = this.entityManager
      .createQueryBuilder(TaskEntity, 't')
      .select([
        't.id AS id',
        'c.endDate AS endDate',
        'a.authorName AS authorName',
        'tfr.id AS fileId',
      ])
      .leftJoin(AuthorNameEntity, 'a', 'a.userId = t.userId')
      .leftJoin(ClassEntity, 'c', 'c.id = t.classId')
      .leftJoin(TaskFileRelationEntity, 'tfr', 'tfr.taskId = t.id')
      .where('t.id = :taskId', { taskId: dto.id })
      .andWhere('t.userId = :userId', { userId: user.userId });

    const taskValidation = await queryBuilder.getRawOne();

    if (!taskValidation) {
      throw new ConflictException('수정할 수 없는 과제입니다.');
    }

    if (dayjs().diff(dayjs(taskValidation.endDate), 'day') > 0) {
      throw new BadRequestException('과제 제출 기간이 아닙니다.');
    }

    await this.entityManager.transaction(async (manager) => {
      // 필명 수정
      if (dto.authorName) {
        // 중복되는 필명이 있는지 확인
        const existingAuthorName = await manager
          .createQueryBuilder(AuthorNameEntity, 'a')
          .select(['a.userId'])
          .where('a.authorName = :authorName', { authorName: dto.authorName })
          .getOne();

        if (existingAuthorName) {
          // 중복된 필명이 본인의 필명인지 확인
          if (existingAuthorName.userId !== user.userId) {
            throw new ConflictException('이미 사용중인 필명입니다.');
          }
        } else {
          // 중복되지 않았다면 새로운 userId, authorName 생성
          await manager.delete(AuthorNameEntity, { userId: user.userId });
          await manager.save(AuthorNameEntity, {
            userId: user.userId,
            authorName: dto.authorName,
          });
        }
      } else {
        // 필명을 입력하지 않았을 경우 user.name을 사용
        dto.authorName = user.name;
      }

      // 텍스트 수정
      if (dto.text) {
        await manager.update(TaskEntity, { id: dto.id }, { text: dto.text });
      }

      // 파일 수정
      if (file) {
        const fileId = await manager
          .save(FigcFileEntity, {
            fileOriginName: file[0].originalname,
            fileTransedName: file[0].fileTransedName,
            extension: file[0].extension,
          })
          .then((res) => res.fileId);

        await manager.update(
          TaskFileRelationEntity,
          { id: taskValidation.fileId },
          { fileId },
        );
      }
    });
  }

  // 과제 상세
  async taskDetail(id: number, isAdmin: boolean, user?: UserDto) {
    const res = await this.entityManager
      .createQueryBuilder(TaskEntity, 't')
      .select([
        't.id AS id',
        't.created_at AS submitDate',
        'c.year AS year',
        'c.semester AS semester',
        'c.sequence AS sequence',
        'c.question AS question',
        'c.created_at AS createdAt',
        'i.instructor_name AS instructorName',
        'c.title AS title',
        'c.task_type AS taskType',
        `CASE 
          WHEN c.task_type = 'T' THEN t.text
          ELSE CONCAT('${process.env.S3_TASK_PATH}/', f.file_transed_name)
        END AS answer
        `,
        'a.author_name AS authorName',
        'c.video_url AS videoUrl',
        'c.id AS classId',
        'c.status AS status',
        'u.id AS userId',
        'u.name AS userName',
        'u.email AS userEmail',
        'd.name AS department',
        't.like_cnt AS likeCnt',
      ])
      .leftJoin(ClassEntity, 'c', 't.class_id = c.id')
      .leftJoin(InstructorEntity, 'i', 'c.instructor_id = i.id')
      .leftJoin(TaskFileRelationEntity, 'tf', 'tf.task_id = t.id')
      .leftJoin(FigcFileEntity, 'f', 'tf.file_id = f.id')
      .leftJoin(AuthorNameEntity, 'a', 'a.user_id = t.user_id')
      .leftJoin(UserEntity, 'u', 'a.user_id = u.id')
      .leftJoin(
        DepartmentEntity,
        'd',
        `d.id = (
          SELECT parent_id 
          FROM closure_department 
          WHERE child_id = u.dept_id 
          ORDER BY (
            CASE 
              WHEN parent_id = 1 THEN 2
              ELSE 1
            END
          ), parent_id ASC
          LIMIT 1
        )`,
      )
      .where('t.id = :id', { id })
      .andWhere(
        new Brackets((sq) => {
          if (!isAdmin) {
            sq.andWhere('t.user_id = :userId', { userId: user.userId });
          }
        }),
      )
      .getRawOne();

    if (!res)
      throw new ConflictException('삭제되었거나 존재하지 않는 Task입니다.');

    return res;
  }

  async getClassList() {
    return await this.entityManager
      .createQueryBuilder(ClassEntity, 'c')
      .select([
        'c.id AS id',
        'c.year AS year',
        'c.semester AS semester',
        'c.sequence AS sequence',
        'c.title AS title',
      ])
      .orderBy('c.year', 'DESC')
      .addOrderBy('c.semester', 'DESC')
      .addOrderBy('c.sequence', 'DESC')
      .getRawMany();
  }

  //
  async taskUpdateByAdmin(dto: UpdateTaskAdminDto, user: UserDto) {
    const taskValidation = await this.entityManager
      .createQueryBuilder(TaskEntity, 't')
      .select(['t.id', 't.text AS text'])
      .leftJoin(ClassEntity, 'c', 'c.id = t.classId')
      .where('t.id = :id', { id: dto.id })
      .andWhere('c.taskType = :taskType', { taskType: 'T' })
      .getRawOne();

    if (!taskValidation) {
      throw new BadRequestException('수정할 수 없는 과제입니다.');
    }

    await this.entityManager.transaction(async (manager) => {
      // 과제 로그 추가
      await manager.save(TaskUpdateLogEntity, {
        taskId: dto.id,
        userId: user.userId,
        beforeContent: taskValidation.text,
      });
      // 과제 수정
      await manager.update(
        TaskEntity,
        { id: dto.id },
        {
          text: dto.content,
        },
      );
    });
  }
}
