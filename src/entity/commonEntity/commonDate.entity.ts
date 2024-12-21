// common date columns entity

import { CreateDateColumn, DeleteDateColumn, UpdateDateColumn } from 'typeorm';

export class CommonDate {
  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  public createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at', nullable: true })
  public updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', name: 'deleted_at', nullable: true })
  public deletedAt: Date;
}
