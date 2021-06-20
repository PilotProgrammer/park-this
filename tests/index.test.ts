import { assert } from 'console';
import { Connection, EntityManager, getConnection, QueryRunner, TreeChildren } from 'typeorm';
var Fakerator = require("fakerator");

import { connectFromLocal, ConsecutiveRow, Garage, Level, Spot, Vehicle } from '../src'
import { SpotType } from '../src/entities/SpotType';
import { VehicleType } from '../src/entities/VehicleType';

let connMan: ConnectionManager;
let transaction: QueryRunner;

beforeAll(async () => {
  connMan = new ConnectionManager();
});

beforeEach(async () => {
  const conn = await connMan.getConnection();
  transaction = conn.createQueryRunner();
  await transaction.startTransaction()
});

afterEach(async () => {
  try {
    await transaction.rollbackTransaction();
  } finally {
    await transaction.release();
  }
})

afterAll(() => getConnection().close());


it("test", async () => {

  // const garageRepo = conn.getRepository(Garage);
  // const levelRepo = conn.getRepository(Level);
  // const rowRepo = conn.getRepository(ConsecutiveRow);
  // const spotRepo = conn.getRepository(Spot);
  // const carRepo = conn.getRepository(Vehicle);


  var fakerator = Fakerator("en-AU"); // cuz there's not one for en-US

  const connMan = new ConnectionManager();
  const fact = new GarageFactory(connMan);
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

  const garageRepo = transaction.manager.getRepository(Garage);
  const foundGarage = await garageRepo.findOneOrFail(garage.id);

  expect(foundGarage).toBeDefined();

  // const spot = new Vehicle();
  // spot.color = "red";
  // spot.licensePlateNumber = "123asdf"
  // spot.name = "Camero";
  // spot.vehicleType = VehicleType.Automobile
  // await spotRepo.save(spot);
  console.log("hello!")
})

export class ConnectionManager {

  // TODO: array of connections to allow running parallel jest test execution (allow removing --runInBand from execution parameters)
  // private connections: Connection[] = [] 
  // public pushConn(conn: Connection) {
  //   this.connections.push(conn);
  // }
  // public popConn(conn: Connection) {
  //   return this.connections.pop();
  // }

  private connection?: Connection;

  public async getConnection() {
    if (this.connection == null) {
      this.connection = await connectFromLocal();
    }
    return this.connection;
  }

  public async executeTransaction(statementsToExecute: (db: EntityManager) => any) {
    const db = await this.getConnection();
    return await db.transaction(statementsToExecute);
  }
}


export class GarageFactory {
  // public constructor(private dbConnection: Connection) { }
  public constructor(private connectionManager: ConnectionManager) { }

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
    this.connectionManager.executeTransaction(async (db: EntityManager) => {
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