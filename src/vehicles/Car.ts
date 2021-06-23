import { getDbConnection } from "../utility/getDbConnection";
import { EntityManager } from "typeorm";
import { Garage } from "../entities/Garage";
import { Spot } from "../entities/Spot";
import { Vehicle } from "../entities/Vehicle";
import { IVehicle } from "./IVehicle";
import { SpotType } from "../entities/SpotType";

export class Car extends Vehicle implements IVehicle {
  // allow parking of car in any spot that is vacant and not motorcycle spot type
  async park(garage: Garage, levelNum: number, rowNum: number, spotNum: number): Promise<boolean> {
    this.validateGarageLevelRowAndSpot(garage, levelNum, rowNum, spotNum);

    // based on all the previous validation that there's no out of bounds index, 
    // the following won't return indexing error, so filter level, row, spot #'s 
    // through hierarchy to get desired Spot object
    const spot = garage.levels.filter(l => l.levelNumber == levelNum)[0]
      .rows.filter(r => r.rowNumber == rowNum)[0]
      .spots.filter(s => s.spotNumber == spotNum)[0];

    if (spot.spotType == SpotType.MotorcycleSpot) 
    throw new Error(`Parking of car in motorcycle spot not allowed`);

    if (spot.occupyingVehicle != null)
      throw new Error(`Spot is already occupied`);

    spot.occupyingVehicle = this;
    spot.occupyingVehicleId = this.id;

    if (this.spots == null)
      this.spots = [];

    this.spots[0] = spot;

    await (await getDbConnection()).transaction(async (db: EntityManager) => {
      await db.createQueryBuilder()
        .update(Spot)
        .set({ occupyingVehicleId: this.id })
        .where("id = :id", { id: spot.id })
        .andWhere('"occupyingVehicleId" is null') // make sure it's still vacant in the database.
        .execute();
    })

    return true;
  }

  async unpark(): Promise<boolean> {
    if (this.spots == null || this.spots.length != 1)
      throw new Error(`Vehicle not currently in a spot or inconsistent state`);

    const currentSpot = this.spots[0];

    const db = await getDbConnection();

    await db.createQueryBuilder()
      .update(Spot)
      .set({ occupyingVehicleId: undefined })
      .where("id = :id", { id: currentSpot.id })
      .execute();

    currentSpot.occupyingVehicle = undefined;
    currentSpot.occupyingVehicleId = undefined;
    this.spots = [];

    return false;
  }
}