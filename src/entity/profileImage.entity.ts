import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { CommonDate } from './commonEntity/commonDate.entity';

@Entity('figgle_file')
export class ProfileFileEntity extends CommonDate {
  @PrimaryGeneratedColumn({ name: 'id' })
  public fileId: number;

  @Column({ name: 'file_origin_name', length: 255 })
  public fileOriginName: string;

  @Column({ name: 'file_transed_name', length: 255, nullable: true })
  public fileTransedName: string;

  @Column({ length: 10, nullable: true })
  public extension: string;

  @Column({ name: 'width', nullable: true })
  public width: number;

  @Column({ name: 'height', nullable: true })
  public height: number;
}
