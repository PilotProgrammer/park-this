
import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { Garage } from './Garage';
import { ParkThisBaseEntity } from './ParkThisBaseEntity';
import { Spot } from './Spot';
import { VehicleType } from './VehicleType';

@Entity("Vehicle")
export class Vehicle extends ParkThisBaseEntity {

  @Column({ type: "citext" })
  public name?: string;

  @Column({ type: "citext" })
  public color?: string;

  @Column({ type: "citext" })
  public licensePlateNumber!: string;

  @Column({ type: "citext" })
  public state!: string;

  @Column("enum", { enum: VehicleType })
  public vehicleType!: VehicleType;

  @OneToMany(type => Spot, spot => spot.occupyingVehicle)
  public spots?: Spot[];

  @OneToOne(() => Garage)
  @JoinColumn()
  public garage?: Garage;

  public enter(garage: Garage): boolean {
    return false;
  }
  
  public leave(): boolean {
    return false;
  }
}
