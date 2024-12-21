import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AdminListEntity } from 'src/entity/adminList.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(AdminListEntity)
    private readonly adminListRepository: Repository<AdminListEntity>,
  ) {}

  async getAdminList(userId: number) {
    return await this.adminListRepository
      .createQueryBuilder('a')
      .select(['a.userId'])
      .where('a.userId = :userId', { userId })
      .getRawOne();
  }
}
