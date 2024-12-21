import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { dataSource } from 'src/config/data-source.config';
import { ClassEntity } from 'src/entity/class.entity';
import { ClosureDepartment } from 'src/entity/closureDepartment.entity';
import { DepartmentEntity } from 'src/entity/department.entity';
import { InstructorEntity } from 'src/entity/instructor.entity';
import { ModuleEntity } from 'src/entity/module.entity';
import { EntityManager } from 'typeorm';

@Injectable()
export class CommonService {
  constructor(
    @InjectEntityManager(dataSource)
    private readonly entityManager: EntityManager,
  ) {}

  async getModuleSearchName() {
    return await this.entityManager
      .createQueryBuilder(ModuleEntity, 'm')
      .select(['m.id AS value', 'm.name AS name'])
      .orderBy('m.name', 'ASC')
      .getRawMany();
  }

  async getInstructorSearchName() {
    return await this.entityManager
      .createQueryBuilder(InstructorEntity, 'i')
      .select(['i.id AS value', 'i.instructor_name AS name'])
      .orderBy('i.instructor_name', 'ASC')
      .getRawMany();
  }

  async getCodeSearchName() {
    return await this.entityManager
      .createQueryBuilder(ClassEntity, 'c')
      .select([
        'c.id AS value',
        `CONCAT(
          c.year, '-', c.semester, '-', 
          LPAD(c.sequence, '3', '0'), 
          IF(c.status = 'I', ' (진행중)', '')
        ) AS name`,
      ])
      .where('c.endDate IS NOT NULL')
      .orderBy('c.year', 'DESC')
      .addOrderBy('c.semester', 'DESC')
      .addOrderBy('c.sequence', 'DESC')
      .getRawMany();
  }

  async getDivision() {
    return await this.entityManager
      .createQueryBuilder(ClosureDepartment, 'c')
      .select(['d.id AS value', 'd.name AS name'])
      .leftJoin(DepartmentEntity, 'd', 'd.id = c.childId')
      .where('c.parentId = 1')
      .orderBy('d.name', 'ASC')
      .getRawMany();
  }
}
