
import { getDbConnection } from '../utility/getDbConnection';
import { Column, Entity, EntityManager, getConnection, JoinColumn, ManyToOne, OneToMany, OneToOne } from 'typeorm';
import { Garage } from './Garage';
import { ParkThisBaseEntity } from './ParkThisBaseEntity';
import { Spot } from './Spot';
import { VehicleType } from './VehicleType';
import { IVehicle } from '../vehicles/IVehicle';

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

    await (await getDbConnection()).transaction(async (db: EntityManager) => {
      await db.createQueryBuilder()
        .update(Vehicle)
        .set({ garageId: garage.id })
        .where("id = :id", { id: this.id })
        .execute();
    })

    return true;
  }

  public async leave(): Promise<boolean> {
    await (await getDbConnection()).transaction(async (db: EntityManager) => {
      await db.createQueryBuilder()
        .update(Vehicle)
        .set({ garageId: undefined })
        .where("id = :id", { id: this.id })
        .execute();
    })

    return true;
  }

  public abstract park(garage: Garage, levelNum: number, rowNum: number, spotNum: number): Promise<boolean>;
  public abstract unpark(): Promise<boolean>;

  protected validateGarageLevelAndRow(garage: Garage, levelNum: number, rowNum: number) {
    if (garage == null)
      throw new Error(`Garage must be provided`);

    if (levelNum < 0 || levelNum >= garage.levels.length)
      throw new Error(`Level number doesn't exist in garage`);

    if (rowNum < 0 || rowNum >= garage.levels[levelNum].rows.length)
      throw new Error(`Row number doesn't exist in requested level`);
  }
}
