import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { ParkThisBaseEntity } from './ParkThisBaseEntity';
import { Level } from './Level';
import { Spot } from './Spot';

@Entity("ConsecutiveRow")
export class ConsecutiveRow extends ParkThisBaseEntity {

  @Column()
  public rowNumber!: number;

  @ManyToOne(type => Level, level => level.rows, { onDelete: "CASCADE", nullable: false })
  public level!: Level;

  @OneToMany(type => Spot, spot => spot.parentRow, { cascade: true })
  public spots!: Spot[];
}

