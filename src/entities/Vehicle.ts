
import { Column, Entity, EntityManager, ManyToOne, OneToMany } from 'typeorm';
import { getDbConnection } from '../utility/getDbConnection';
import { IVehicle } from '../vehicles/IVehicle';
import { Garage } from './Garage';
import { ParkThisBaseEntity } from './ParkThisBaseEntity';
import { Spot } from './Spot';
import { SpotType } from './SpotType';
import { VehicleType } from './VehicleType';

@Entity("Vehicle")
export abstract class Vehicle extends ParkThisBaseEntity implements IVehicle {

  // subclasses implement to indicate how many consecutive spots are required to park
  protected abstract spotsRequiredForVehicle(): number;

  // subclasses impement to indicate what spot types are allowed
  protected abstract spotTypesAllowedForVehicle(): Array<SpotType>;
  
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
  public spots!: Spot[];

  @ManyToOne(type => Garage, garage => garage.vehicles, { onDelete: "SET NULL", nullable: true })
  public garage?: Garage;

  @Column({ nullable: true })
  public garageId?: string;

  public getName() {
    return this.name;
  }

  public getColor() {
    return this.color;
  }

  public getLicensePlateNumber() {
    return this.licensePlateNumber;
  }

  public getState() {
    return this.state;
  }

  public getVehicleType() {
    return this.vehicleType;
  }

  public getSpots() {
    return this.spots;
  }

  public getGarage() {
    return this.garage;
  }

  public getGarageId() {
    return this.garageId;
  }

  // validates and executes the desire for a vehicle to enter a garage
  public async enter(garage: Garage) {
    if (this.garage != null && this.garage.id != garage.id)
      throw new Error(`Can't enter a new garage ${garage.id} until vehicle leaves current garage ${this.garage.id}`);

    if (await garage.canFit(this) == false)
      throw new Error(`Garage can't fit this vehicle`);

    // set the garage reference of this vehicle
    this.garage = garage;
    this.garageId = garage.id;

    // save garage/vehicle pairing to database
    await (await getDbConnection()).transaction(async (db: EntityManager) => {
      await db.createQueryBuilder()
        .update(Vehicle)
        .set({ garageId: garage.id })
        .where("id = :id", { id: this.id })
        .execute();
    });

    return true;
  }

  // take the vehicle out of the garage
  public async leave(): Promise<boolean> {
    if (this.garage == null)
      throw new Error(`Vehicle not currently in a garage`);

    // remove the reference to existing garage
    this.garage = undefined;
    this.garageId = undefined;

    // save removal of garage reference to the database
    await (await getDbConnection()).transaction(async (db: EntityManager) => {
      await db.createQueryBuilder()
        .update(Vehicle)
        .set({ garageId: undefined })
        .where("id = :id", { id: this.id })
        .execute();
    })

    return true;
  }

  // once vehicle is in the garage, part is in the spot as indicated by level, row, and spot number.
  // the "spotNum" actually indicates the STARTING spot number.
  // this method works for buses, cars, and bikes. 
  // because each vehicle implements spotsRequiredForVehicle(), cars/bike will only have ONE entry in occupiedSpots,
  // but buses will have 5. 
  public async park(garage: Garage, levelNum: number, rowNum: number, spotNum: number): Promise<boolean> {
    if (this.spots != null && this.spots.length > 0)
      throw new Error(`Vehicle currently in a spot so cannot park again`);

    // no null references :)
    if (this.spots == null)
      this.spots = [];

    // collect all the spots that this vehicle will occupy
    const occupiedSpots: Array<Spot> = [];

    // count from the starting spotNum up to the spotsRequiredForVehicle based on vehicle type
    // for bikes and cars this will only execute once. 
    for (let spotIndx = spotNum; spotIndx < spotNum + this.spotsRequiredForVehicle(); spotIndx++) {
      // make sure spot exists
      this.validateGarageLevelRowAndSpot(garage, levelNum, rowNum, spotIndx);

      // get the spot
      const spot = garage.levels.filter(l => l.levelNumber == levelNum)[0]
        .rows.filter(r => r.rowNumber == rowNum)[0]
        .spots.filter(s => s.spotNumber == spotIndx)[0];

      // make sure it's an allowed spot type based on the vehicle type
      if (this.spotTypesAllowedForVehicle().includes(spot.spotType) == false)
        throw new Error(`Spot type ${spot.spotType} not allowed for vehicle type ${this.vehicleType}`);

      // make sure it's empty
      if (spot.occupyingVehicle != null)
        throw new Error(`Spot is already occupied`);

      // save referenc to the vehicle on the spots
      spot.occupyingVehicle = this;
      spot.occupyingVehicleId = this.id;
      occupiedSpots.push(spot);
    }

    // save reference to the spots on vehicle
    this.spots = occupiedSpots;

    // save all of it to the database
    const db = await getDbConnection();
    await db.transaction(async (db: EntityManager) => {
      this.spots.forEach(async (spot: Spot) => {
        await db.createQueryBuilder()
          .update(Spot)
          .set({ occupyingVehicleId: this.id })
          .where("id = :id", { id: spot.id })
          .andWhere('"occupyingVehicleId" is null') // make sure it's still vacant in the database.
          .execute();
      })
    })

    return true;
  }

  // leave the parking spot. for cars/bikes, this.spots will be just one.
  // and for buses, this.spots would be 5. Therefore, the same implementation
  // here works for all vehicles based on the invididual vehicles reponse to
  // spotsRequiredForVehicle()
  public async unpark(): Promise<boolean> {
    if (this.spots == null || this.spots.length != this.spotsRequiredForVehicle())
      throw new Error(`Vehicle not currently in a spot or inconsistent state`);

    const db = await getDbConnection();
    await db.transaction(async (db: EntityManager) => {
      this.spots.forEach(async (spot: Spot) => {
        spot.occupyingVehicle = undefined;
        spot.occupyingVehicleId = undefined;

        await db.createQueryBuilder()
          .update(Spot)
          .set({ occupyingVehicleId: undefined })
          .where("id = :id", { id: spot.id })
          .execute();
      })
    })

    this.spots = [];

    return true;
  }

  // make sure we don't park out in the middle of the air, in the grass, or underwater!!
  protected validateGarageLevelRowAndSpot(garage: Garage, levelNum: number, rowNum: number, spotNum: number) {
    if (garage == null)
      throw new Error(`Garage must be provided`);

    if (levelNum < 0 || levelNum >= garage.levels.length)
      throw new Error(`Level number doesn't exist in garage`);

    if (rowNum < 0 || rowNum >= garage.levels[levelNum].rows.length)
      throw new Error(`Row number doesn't exist in requested level`);

    if (spotNum < 0 || spotNum >= garage.levels[levelNum].rows[rowNum].spots.length)
      throw new Error(`Spot number doesn't exist in requested row`);
  }
}
