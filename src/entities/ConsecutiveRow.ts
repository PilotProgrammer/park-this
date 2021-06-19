import { Entity, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Level } from './Level';
import { Spot } from './Spot';

@Entity("ConsecutiveRow")
export class ConsecutiveRow extends BaseEntity {

  @ManyToOne(type => Level, level => level.rows, { onDelete: "CASCADE", nullable: false })
  public level!: Level;

  @OneToMany(type => Spot, spot => spot.parentRow, { cascade: true })
  public spots!: Spot[];
}

