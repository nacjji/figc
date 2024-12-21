import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { CommonDate } from './commonEntity/commonDate.entity';

/**
 * @description Module Entity
 */
@Entity({ name: 'figc_module' })
export class ModuleEntity extends CommonDate {
  @PrimaryGeneratedColumn({ type: 'int' })
  public id: number;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: false,
    comment: '모듈 이름',
  })
  public name: string;
}
