import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Garage } from './Garage';
import { Level } from './Level';
import { Spot } from './Spot';
import { VehicleType } from './VehicleType';

@Entity("ConsecutiveRow")
export class ConsecutiveRow extends BaseEntity {

  @ManyToOne(type => Level, level => level.rows, { onDelete: "CASCADE", nullable: false })
  public level!: Level;

  @OneToMany(type => Spot, spot => spot.parentRow, { cascade: true })
  public spots!: Spot[];
}

