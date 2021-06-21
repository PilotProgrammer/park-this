import { assert } from 'console';
import { Connection, EntityManager, getConnection, getConnectionManager, QueryRunner, TreeChildren } from 'typeorm';
var Fakerator = require("fakerator");

import { ConsecutiveRow, Garage, Level, Spot, Vehicle } from '../src'
import { SpotType } from '../src/entities/SpotType';
import { VehicleType } from '../src/entities/VehicleType';
import { getDbConnection } from '../src/utility/getDbConnection';


beforeAll(async () => {

});

beforeEach(async () => {
  // connMan.executeTransaction(async (db: EntityManager) => {
  //   const garageRepo = db.getRepository(Garage);
  //   await garageRepo.clear();
  //   // await garageRepo.query('DELETE FROM public."Garage"');
  // })
});

// afterAll(() => connMan.disconnect());

it("test", async () => {

  var fakerator = Fakerator("en-AU"); // cuz there's not one for en-US

  const fact = new GarageFactory();
  const garage = fact.planGarage(
    fakerator.names.firstName(),
    fakerator.names.firstName(),
    fakerator.address.street(),
    fakerator.address.city(),
    fakerator.names.firstName(),
    fakerator.address.postCode(),
  );

  fact.addLevel(garage);
  fact.addLevel(garage);
  fact.addLevel(garage);

  await fact.buildGarage(garage);

  const garageRepo = (await getDbConnection()).getRepository(Garage);
  const foundGarage = await garageRepo.findOneOrFail({ id: garage.id });

  expect(foundGarage.name).toBe(garage.name);

  // const spot = new Vehicle();
  // spot.color = "red";
  // spot.licensePlateNumber = "123asdf"
  // spot.name = "Camero";
  // spot.vehicleType = VehicleType.Automobile
  // await spotRepo.save(spot);
  console.log("hello!")
})



export class GarageFactory {

  public planGarage(name: string, company: string, streetAddress: string, city: string, state: string, postalCode: string): Garage {
    const garage = new Garage();

    const propertiesToAssign = {
      name,
      company,
      streetAddress,
      city,
      state,
      postalCode
    }

    const assignedGarage: Garage = Object.assign(garage, propertiesToAssign)

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

  private validateRow(garage: Garage, level: number, row: number) {
    this.validateLevel(garage, level)
    const targetLevel = garage.levels[level];

    if (targetLevel.rows.length > row) // TODO unit test this
      throw new Error(`Requested row ${row} exceeds number of row on garage level ${targetLevel.rows.length}`);
  }


  private validateLevel(garage: Garage, level: number) {
    if (garage.levels.length > level) // TODO unit test this
      throw new Error(`Requested level ${level} exceeds number of levels on garage ${garage.levels.length}`);
  }
}