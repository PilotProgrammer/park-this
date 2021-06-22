
import { getDbConnection } from '../utility/getDbConnection';
import { Column, Entity, EntityManager, getConnection, JoinColumn, ManyToOne, OneToMany, OneToOne } from 'typeorm';
import { Garage } from './Garage';
import { ParkThisBaseEntity } from './ParkThisBaseEntity';
import { Spot } from './Spot';
import { VehicleType } from './VehicleType';
import { IVehicle } from 'src/vehicles/IVehicle';

@Entity("Vehicle")
export abstract class Vehicle extends ParkThisBaseEntity implements IVehicle {

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

  @ManyToOne(type => Garage, garage => garage.vehicles, { onDelete: "SET NULL", nullable: true })
  public garage?: Garage;

  @Column({ nullable: true })
  public garageId?: string;

  public async enter(garage: Garage) {
    if (this.garage != null && this.garage.id != garage.id)
      throw new Error(`Can't enter a new garage ${garage.id} until vehicle leaves current garage ${this.garage.id}`);

    if (await garage.canFit(this) == false)
      throw new Error(`Garage can't fit this vehicle`);

    this.garage = garage;

    await (await getDbConnection()).transaction(async (db: EntityManager) => {
      const repo = db.getRepository(Vehicle);
      await repo.save(this);
    })

    return true;
  }

  public async leave(): Promise<boolean> {
    const db = await getDbConnection();
    await db.getRepository(Vehicle).update(this.id, { garageId: undefined });

    return true;
  }


  public abstract park(spot: Spot): Promise<boolean>;
  public abstract unpark(): Promise<boolean>;
}
