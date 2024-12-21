import { Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity({ name: 'figc_admin_list' })
export class AdminListEntity {
  @PrimaryGeneratedColumn({ name: 'user_id' })
  @OneToOne(() => UserEntity, (user) => user.id)
  public userId: number;
}
