import { getDbConnection } from "../utility/getDbConnection";
import { EntityManager } from "typeorm";
import { Garage } from "../entities/Garage";
import { Spot } from "../entities/Spot";
import { Vehicle } from "../entities/Vehicle";
import { IVehicle } from "./IVehicle";

export class Motorcycle extends Vehicle implements IVehicle {
  async park(garage: Garage, levelNum: number, rowNum: number, spotNum: number): Promise<boolean> {
    // simply allow parking of motorcycle in any spot that is vacant
    this.validateGarageLevelAndRow(garage, levelNum, rowNum);

    if (spotNum < 0 || spotNum >= garage.levels[levelNum].rows[rowNum].spots.length)
      throw new Error(`Row number doesn't exist in requested level`);

    // based on all the previous validation that there's no out of bounds index, 
    // the following won't return indexing error, so filter level, row, spot #'s 
    // through hierarchy to get desired Spot object
    const spot = garage.levels.filter(l => l.levelNumber == levelNum)[0]
      .rows.filter(r => r.rowNumber == rowNum)[0]
      .spots.filter(s => s.spotNumber == spotNum)[0];
    
    if (spot.occupyingVehicle != null) 
      throw new Error(`Spot is already occupied`);

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
    return false;
  }
}