import { assert } from 'console';
import { Connection, EntityManager, getConnection, getConnectionManager, QueryRunner, TreeChildren } from 'typeorm';
var Fakerator = require("fakerator");

import { ConsecutiveRow, Garage, Level, Spot, Vehicle, VehicleFactory } from '../src'
import { VehicleType } from '../src/entities/VehicleType';
import { getDbConnection } from '../src/utility/getDbConnection';
import { Bus } from '../src/vehicles/Bus';
import { Car } from '../src/vehicles/Car';
import { Motorcycle } from '../src/vehicles/Motorcycle';
import { createTestGarage, buildVehicle, validateVehicle } from './TestCommon';

export const fakerator = Fakerator("en-AU"); // cuz there's not one for en-US


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
    const { fact, garage } = await createTestGarage();

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

  it('Create and retrieve bike', async () => {
    const fact = new VehicleFactory();
    const bike = await buildVehicle(fact, VehicleType.Motorcycle);
    expect(bike instanceof Motorcycle).toBeTruthy();

    const findBikeResults = await fact.findVehicle({ licensePlateNumber: bike.licensePlateNumber, state: bike.state });

    expect(findBikeResults.length).toBe(1);
    const foundBike = findBikeResults[0];
    expect(foundBike instanceof Motorcycle).toBeTruthy();
    validateVehicle(foundBike, bike);
  })

  it('Create and retrieve car', async () => {
    const fact = new VehicleFactory();
    const car = await buildVehicle(fact, VehicleType.Car);
    expect(car instanceof Car).toBeTruthy();

    const findResults = await fact.findVehicle({ licensePlateNumber: car.licensePlateNumber, state: car.state });

    expect(findResults.length).toBe(1);
    const foundCar = findResults[0];
    expect(foundCar instanceof Car).toBeTruthy();
    validateVehicle(foundCar, car);
  })

  it('Create and retrieve bus', async () => {
    const fact = new VehicleFactory();
    const bus = await buildVehicle(fact, VehicleType.Bus);
    expect(bus instanceof Bus).toBeTruthy();

    const findResults = await fact.findVehicle({ licensePlateNumber: bus.licensePlateNumber, state: bus.state });

    expect(findResults.length).toBe(1);
    const foundBus = findResults[0];
    expect(foundBus instanceof Bus).toBeTruthy();
    validateVehicle(foundBus, bus);
  })
})

describe('Enter and leave garage', () => {
  it('Enter', async () => {
    const fact = new VehicleFactory();
    const bus = await buildVehicle(fact, VehicleType.Bus);

    const { garage } = await createTestGarage();

    await bus.enter(garage)
  })


})



