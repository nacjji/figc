import { Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'figc_config' })
export class FigcConfigEntity {
  @PrimaryColumn({
    name: 'current_year',
    type: 'int',
    comment: '현재 연도',
  })
  public currentYear: number;

  @PrimaryColumn({
    name: 'current_semester',
    type: 'int',
    comment: '현재 분기',
  })
  public currentSemester: number;

  @PrimaryColumn({
    name: 'current_sequence',
    type: 'int',
    comment: '현재 회차',
  })
  public currentSequence: number;
}
