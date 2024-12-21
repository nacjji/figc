import { Entity, PrimaryColumn } from 'typeorm';

@Entity('closure_department')
export class ClosureDepartment {
  @PrimaryColumn({ name: 'parent_id' })
  public parentId: number;

  @PrimaryColumn({ name: 'child_id' })
  public childId: number;
}
