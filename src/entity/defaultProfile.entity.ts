import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { CommonDate } from './commonEntity/commonDate.entity';

@Entity('default_profile')
export class DefaultProfileEntity extends CommonDate {
  @PrimaryGeneratedColumn({ name: 'id' })
  public defaultProfileId: number;

  @Column({ name: 'file_origin_name', length: 255 })
  public fileOriginName: string;

  @Column({
    name: 'file_transed_name',
    length: 255,
    nullable: true,
  })
  public fileTransedName: string;

  @Column({ length: 10, nullable: true })
  public extension: string;
}
