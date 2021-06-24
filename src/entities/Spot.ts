
import { Column, Entity, ManyToOne } from 'typeorm';
import { ConsecutiveRow } from './ConsecutiveRow';
import { ParkThisBaseEntity } from './ParkThisBaseEntity';
import { SpotType } from './SpotType';
import { Vehicle } from './Vehicle';



@Entity("Spot")
export class Spot extends ParkThisBaseEntity {

  @Column()
  public spotNumber!: number;

  @ManyToOne(type => ConsecutiveRow, row => row.spots, { onDelete: "CASCADE", nullable: false })
  public parentRow!: ConsecutiveRow;

  @ManyToOne(type => Vehicle, vehicle => vehicle.spots, { cascade: true, nullable: true })
  public occupyingVehicle?: Vehicle;

  @Column({ nullable: true })
  public occupyingVehicleId?: string

  @Column("enum", { enum: SpotType })
  public spotType!: SpotType;
}