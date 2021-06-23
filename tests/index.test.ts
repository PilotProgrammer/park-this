import { assert } from 'console';
import { Connection, EntityManager, getConnection, getConnectionManager, QueryRunner, TreeChildren } from 'typeorm';
var Fakerator = require("fakerator");

import { ConsecutiveRow, Garage, Level, Spot, Vehicle, VehicleFactory } from '../src'
import { VehicleType } from '../src/entities/VehicleType';
import { getDbConnection } from '../src/utility/getDbConnection';
import { Bus } from '../src/vehicles/Bus';
import { Car } from '../src/vehicles/Car';
import { Motorcycle } from '../src/vehicles/Motorcycle';
import { createTestGarage, buildVehicle, validateVehicle, testSingleVehicleParkingInSpot } from './TestCommon';

export const fakerator = Fakerator("en-AU"); // cuz there's not one for en-US


beforeAll(async () => {
  (await getDbConnection()).transaction(async (db: EntityManager) => {
    // .clear() translates to "truncate", and doens't work in postgres because foreign key exists, even though it's set to "oncascade: delete"
    const garageRepo = db.getRepository(Garage);
    await garageRepo.query('DELETE FROM public."Garage"');

    const vehicleRepo = db.getRepository(Vehicle);
    await vehicleRepo.query('DELETE FROM public."Vehicle"');
  })
});

beforeEach(async () => {

});

// afterAll(() => connMan.disconnect());


describe('Garage operations', () => {
  it('Park and unpark a motorcycle from motorcycle spot', async () => {
    const levelNum = 1;
    const rowNum = 0;
    const spotNum = 6;

    await testSingleVehicleParkingInSpot(levelNum, rowNum, spotNum);
  })

  it('Park and unpark a motorcycle from compact spot', async () => {
    const levelNum = 1;
    const rowNum = 1;
    const spotNum = 0;

    await testSingleVehicleParkingInSpot(levelNum, rowNum, spotNum);
  })

  it('Park and unpark a motorcycle from large spot', async () => {
    const levelNum = 1;
    const rowNum = 1;
    const spotNum = 3;

    await testSingleVehicleParkingInSpot(levelNum, rowNum, spotNum);
  })

  it('Make sure you cant park a motorcycle in an occupied spot', async () => {
    const levelNum = 1;
    const rowNum = 1;
    const spotNum = 3;

    const { garageFactory, vehicleFact, garage, vehicle } = await testSingleVehicleParkingInSpot(levelNum, rowNum, spotNum);
    
    const anotherVehicle = await buildVehicle(vehicleFact, VehicleType.Motorcycle);
    await anotherVehicle.enter(garage)

    const findResults = await garageFactory.findGarage({ name: garage.name, company: garage.company });
    expect(findResults.length).toBe(1);
    const garageWithTwoBikes = findResults[0];

    let thereWasAProblem = false;

    // try to park a vehicle in a spot that's already occupied!
    try {
      await anotherVehicle.park(garageWithTwoBikes, levelNum, rowNum, spotNum);
    } catch (err) {
      expect(err.message).toBe(`Spot is already occupied`);
      thereWasAProblem = true;
    }

    // should have thrown an error
    expect(thereWasAProblem).toBe(true);
  })


  it('Enter and leave garage', async () => {
    const vehicleFact = new VehicleFactory();
    const bus = await buildVehicle(vehicleFact, VehicleType.Bus);

    const { fact, garage } = await createTestGarage();

    // Bus enters garage
    await bus.enter(garage);

    // check that garage says there's a bus in it
    const findResults = await fact.findGarage({ name: garage.name, company: garage.company });
    expect(findResults.length).toBe(1);
    const vehiclesInGarage = await findResults[0].getAllVehiclesInGarage();
    expect(vehiclesInGarage.length).toBe(1);
    expect(vehiclesInGarage[0] instanceof Bus);
    expect(vehiclesInGarage[0].licensePlateNumber).toBe(bus.licensePlateNumber);

    // leave garage
    await bus.leave();

    // check that garage is empty
    const findResultsLeave = await fact.findGarage({ name: garage.name, company: garage.company });
    expect(findResultsLeave.length).toBe(1);
    const hopefullyNoVehiclesInGarage = await findResultsLeave[0].getAllVehiclesInGarage();
    expect(hopefullyNoVehiclesInGarage.length).toBe(0);
  })

  // TODO edge cases
  // * check you can't enter another garage when you're already in one!
  // * check that you can't leave a garage when you're not in one!

  // TODO unit test where Garage.canFit is false (requires method implementation)
})

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


