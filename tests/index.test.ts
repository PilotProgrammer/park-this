import { assert } from 'console';
import { Connection, EntityManager, getConnection, getConnectionManager, QueryRunner, TreeChildren } from 'typeorm';
var Fakerator = require("fakerator");

import { ConsecutiveRow, Garage, Level, Spot, Vehicle, GarageFactory, VehicleFactory } from '../src'
// import { GarageFactory } from '../src/factory/GarageFactory'
import { SpotType } from '../src/entities/SpotType';
import { VehicleType } from '../src/entities/VehicleType';
import { getDbConnection } from '../src/utility/getDbConnection';


beforeAll(async () => {

});

beforeEach(async () => {
  (await getDbConnection()).transaction(async (db: EntityManager) => {
    // .clear() translates to "truncate", and doens't work in postgres because foreign key exists, even though it's set to "oncascade: delete"
    const garageRepo = db.getRepository(Garage);
    await garageRepo.query('DELETE FROM public."Garage"');

    const vehicleRepo = db.getRepository(Vehicle);
    await vehicleRepo.query('DELETE FROM public."Vehicle"');
  })
});

// afterAll(() => connMan.disconnect());

describe('Test build garage', () => {

  it('GarageFactory base case', async () => {

    var fakerator = Fakerator("en-AU"); // cuz there's not one for en-US

    const fact = new GarageFactory();
    const garage = fact.planGarage( {
      name: fakerator.names.firstName(),
      company: fakerator.names.firstName(),
      streetAddress: fakerator.address.street(),
      city: fakerator.address.city(),
      state: fakerator.names.firstName(),
      postalCode: fakerator.address.postCode()
    });

    // add 2 levels
    fact.addLevel(garage);
    fact.addLevel(garage);

    // add 3 rows to level 0
    fact.addRow(garage, BigInt(0));
    fact.addRow(garage, BigInt(0));
    fact.addRow(garage, BigInt(0));

    // add 2 rows to level 1 
    fact.addRow(garage, BigInt(1));
    fact.addRow(garage, BigInt(1));

    // add spots to level 0 row 1 - 8 spots
    fact.addSpot(garage, BigInt(0), BigInt(0), SpotType.CompactSpot);
    fact.addSpot(garage, BigInt(0), BigInt(0), SpotType.CompactSpot);
    fact.addSpot(garage, BigInt(0), BigInt(0), SpotType.CompactSpot);
    fact.addSpot(garage, BigInt(0), BigInt(0), SpotType.MotorcycleSpot);
    fact.addSpot(garage, BigInt(0), BigInt(0), SpotType.MotorcycleSpot);
    fact.addSpot(garage, BigInt(0), BigInt(0), SpotType.LargeSpot); // TODO test that a bus can't park here. start off counting enough large spots but overflows row
    fact.addSpot(garage, BigInt(0), BigInt(0), SpotType.LargeSpot);
    fact.addSpot(garage, BigInt(0), BigInt(0), SpotType.LargeSpot);

    // add spots to level 0 row 2 - 8 spots
    fact.addSpot(garage, BigInt(0), BigInt(1), SpotType.MotorcycleSpot);
    fact.addSpot(garage, BigInt(0), BigInt(1), SpotType.MotorcycleSpot);
    fact.addSpot(garage, BigInt(0), BigInt(1), SpotType.LargeSpot); // TODO test that a bus can fit here, but not two busses in this row simultaneously
    fact.addSpot(garage, BigInt(0), BigInt(1), SpotType.LargeSpot);
    fact.addSpot(garage, BigInt(0), BigInt(1), SpotType.LargeSpot);
    fact.addSpot(garage, BigInt(0), BigInt(1), SpotType.LargeSpot);
    fact.addSpot(garage, BigInt(0), BigInt(1), SpotType.LargeSpot);
    fact.addSpot(garage, BigInt(0), BigInt(1), SpotType.LargeSpot);

    // add spots to level 0 row 3 - 10 spots
    fact.addSpot(garage, BigInt(0), BigInt(2), SpotType.LargeSpot); // TODO test two busses can fit in this row
    fact.addSpot(garage, BigInt(0), BigInt(2), SpotType.LargeSpot);
    fact.addSpot(garage, BigInt(0), BigInt(2), SpotType.LargeSpot);
    fact.addSpot(garage, BigInt(0), BigInt(2), SpotType.LargeSpot);
    fact.addSpot(garage, BigInt(0), BigInt(2), SpotType.LargeSpot);
    fact.addSpot(garage, BigInt(0), BigInt(2), SpotType.LargeSpot);
    fact.addSpot(garage, BigInt(0), BigInt(2), SpotType.LargeSpot);
    fact.addSpot(garage, BigInt(0), BigInt(2), SpotType.LargeSpot);
    fact.addSpot(garage, BigInt(0), BigInt(2), SpotType.LargeSpot);
    fact.addSpot(garage, BigInt(0), BigInt(2), SpotType.LargeSpot);

    // add spots to level 1 row 0 - 7 spots
    fact.addSpot(garage, BigInt(1), BigInt(0), SpotType.MotorcycleSpot); // only bikes in this row
    fact.addSpot(garage, BigInt(1), BigInt(0), SpotType.MotorcycleSpot);
    fact.addSpot(garage, BigInt(1), BigInt(0), SpotType.MotorcycleSpot);
    fact.addSpot(garage, BigInt(1), BigInt(0), SpotType.MotorcycleSpot);
    fact.addSpot(garage, BigInt(1), BigInt(0), SpotType.MotorcycleSpot);
    fact.addSpot(garage, BigInt(1), BigInt(0), SpotType.MotorcycleSpot);
    fact.addSpot(garage, BigInt(1), BigInt(0), SpotType.MotorcycleSpot);

    // add spots to level 1 row 1 - 8 spots
    fact.addSpot(garage, BigInt(1), BigInt(1), SpotType.CompactSpot);
    fact.addSpot(garage, BigInt(1), BigInt(1), SpotType.CompactSpot);
    fact.addSpot(garage, BigInt(1), BigInt(1), SpotType.CompactSpot);
    fact.addSpot(garage, BigInt(1), BigInt(1), SpotType.LargeSpot); // TODO bus tries to park here, far enough from edge of the row, but not enough large spots
    fact.addSpot(garage, BigInt(1), BigInt(1), SpotType.LargeSpot);
    fact.addSpot(garage, BigInt(1), BigInt(1), SpotType.LargeSpot);
    fact.addSpot(garage, BigInt(1), BigInt(1), SpotType.CompactSpot);
    fact.addSpot(garage, BigInt(1), BigInt(1), SpotType.CompactSpot);

    await fact.buildGarage(garage);

    const result = await fact.findGarage({ name: garage.name, company: garage.company });

    expect(result.length).toBe(1);
    const foundGarage = result[0];
    expect(foundGarage.name).toBe(garage.name);
    expect(foundGarage.company).toBe(garage.company);

    // 2 levels
    expect(foundGarage.levels.length).toBe(2);

    // 3 rows in level 0
    expect(foundGarage.levels[0].rows.length).toBe(3);

    // 2 rows in level 1
    expect(foundGarage.levels[1].rows.length).toBe(2);

    // verify count of all spots in level 0
    expect(foundGarage.levels[0].rows[0].spots.length).toBe(8);
    expect(foundGarage.levels[0].rows[1].spots.length).toBe(8);
    expect(foundGarage.levels[0].rows[2].spots.length).toBe(10);

    // verify count of all spots in level 1
    expect(foundGarage.levels[1].rows[0].spots.length).toBe(7);
    expect(foundGarage.levels[1].rows[1].spots.length).toBe(8);

    console.log('test end')
  })

  // TODO edge cases when building garage
// level that is out of bounds
// spot that is out of bounds
})

describe('VehicleFactory tests', () => {
  it('Create and retrieve a vehicle', async() => {
    const fact = new VehicleFactory();
    // const vehicle = fact.
    // const spot = new Vehicle();
    // spot.color = "red";
    // spot.licensePlateNumber = "123asdf"
    // spot.name = "Camero";
    // spot.vehicleType = VehicleType.Automobile
    // await spotRepo.save(spot);
  })
})


