import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('figc_author_name')
export class AuthorNameEntity {
  // user테이블의 userId를 외래키임과 동시에 기본키로 설정
  @PrimaryGeneratedColumn({ name: 'user_id' })
  @OneToOne(() => UserEntity, (user) => user.id)
  public userId: number;

  @Column({ name: 'author_name', type: 'varchar', length: 10 })
  public authorName: string;
}
