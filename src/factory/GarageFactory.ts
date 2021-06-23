import { ConsecutiveRow } from '../entities/ConsecutiveRow';
import { Garage } from '../entities/Garage';
import { Level } from '../entities/Level';
import { Spot } from '../entities/Spot';
import { SpotType } from '../entities/SpotType';
import { getDbConnection } from '../utility/getDbConnection';
import { EntityManager } from 'typeorm';

export type PlannedGarageRequest = {
  name: string, company: string, streetAddress: string, city: string, state: string, postalCode: string
}

export type SearchGarageRequest = { name?: string, company?: string }

export class GarageFactory {

  public planGarage(request: PlannedGarageRequest): Garage {
    const garage = new Garage();
    const assignedGarage: Garage = Object.assign(garage, request)

    assignedGarage.levels = new Array<Level>(); // TODO array of interfaces
    return assignedGarage;
  }

  public addLevel(garage: Garage) {
    const newLevel = new Level();
    newLevel.rows = new Array<ConsecutiveRow>(); // TODO array of interfaces
    let currentLevelCount = garage.levels.length;
    newLevel.levelNumber = currentLevelCount++;
    garage.levels.push(newLevel);
  }

  public addRow(garage: Garage, level: BigInt) {
    const levelNum = Number(level);
    this.validateLevel(garage, levelNum);

    const newRow = new ConsecutiveRow();
    newRow.spots = new Array<Spot>(); // TODO array of interfaces
    const targetLevel = garage.levels[levelNum];
    let currentRowCount = targetLevel.rows.length;
    newRow.rowNumber = currentRowCount++;
    targetLevel.rows.push(newRow);

    return garage;
  }

  public addSpot(garage: Garage, level: BigInt, row: BigInt, spotType: SpotType) {
    const levelNum = Number(level);
    const rowNum = Number(row);
    this.validateRow(garage, levelNum, rowNum);

    const newSpot = new Spot();
    newSpot.spotType = spotType;
    const targetRow = garage.levels[levelNum].rows[rowNum]
    let currentSpotCount = targetRow.spots.length;
    newSpot.spotNumber = currentSpotCount++;
    targetRow.spots.push(newSpot);

    return garage;
  }

  public async buildGarage(garage: Garage) {
    // TODO validate that garage has at least one level, all levels have at least one row, and all rows have at least one spot

    // the reason it might be confusing that there's not "db" instantiated and passed to executeTransaction here,
    // is per https://orkhan.gitbook.io/typeorm/docs/transactions, "The most important restriction when working 
    // in an transaction is, to ALWAYS use the provided instance of entity manager". In other words, the db will
    // be injected in to the async function below, on it's behalf.
    await (await getDbConnection()).transaction(async (db: EntityManager) => {
      const garageRepo = db.getRepository(Garage);
      await garageRepo.save(garage);
    })
  }

  public async findGarage(searchParams: SearchGarageRequest) {
    const repo = (await getDbConnection()).getRepository(Garage);
    const result = await repo.find({
      where: searchParams,
      relations: ['levels', 'levels.rows', 'levels.rows.spots', 'vehicles', 'levels.rows.spots.occupyingVehicle']
    });

    return result;
  }

  private validateRow(garage: Garage, level: number, row: number) {
    this.validateLevel(garage, level)
    const targetLevel = garage.levels[level];

    if (row > targetLevel.rows.length) // TODO unit test this
      throw new Error(`Requested row ${row} exceeds number of row on garage level ${targetLevel.rows.length}`);
  }


  private validateLevel(garage: Garage, level: number) {
    if (level > garage.levels.length) // TODO unit test this
      throw new Error(`Requested level ${level} exceeds number of levels on garage ${garage.levels.length}`);
  }


}