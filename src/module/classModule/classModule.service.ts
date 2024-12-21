import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { dataSource } from 'src/config/data-source.config';
import { ClassEntity } from 'src/entity/class.entity';
import { FigcConfigEntity } from 'src/entity/figcConfig.entity';
import { ModuleEntity } from 'src/entity/module.entity';
import { EntityManager } from 'typeorm';

@Injectable()
export class ModuleService {
  constructor(
    @InjectEntityManager(dataSource)
    private readonly entityManager: EntityManager,
  ) {}

  // 현재 학기에 해당하는 모듈 리스트
  async getModuleBySemester() {
    const getConfig = await this.entityManager
      .createQueryBuilder(FigcConfigEntity, 'fc')
      .select(['fc.currentYear AS year', 'fc.currentSemester AS semester'])
      .getRawOne();

    const queryBuilder = this.entityManager
      .createQueryBuilder(ClassEntity, 'c')
      .select(['m.id AS value', 'm.name AS name'])
      .leftJoin(ModuleEntity, 'm', 'c.moduleId = m.id')
      .groupBy('m.id');

    const result = await queryBuilder
      .where('c.semester = :semester', {
        semester: getConfig.semester,
      })
      .andWhere('c.year = :year', {
        year: getConfig.year,
      })
      .getRawMany();

    return {
      currentYear: getConfig.year,
      currentSemester: getConfig.semester,
      list: result,
    };
  }
}
