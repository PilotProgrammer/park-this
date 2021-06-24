
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { ConsecutiveRow } from './ConsecutiveRow';
import { Garage } from './Garage';
import { ParkThisBaseEntity } from './ParkThisBaseEntity';

@Entity("Level")
export class Level extends ParkThisBaseEntity {

  @Column()
  public levelNumber!: number;

  @ManyToOne(type => Garage, garage => garage.levels, { onDelete: "CASCADE", nullable: false })
  public garage!: Garage;

  @OneToMany(type => ConsecutiveRow, row => row.level, { cascade: true })
  public rows!: ConsecutiveRow[];

}