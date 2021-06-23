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
  const db = await getDbConnection();
  // .clear() translates to "truncate", and doens't work in postgres because foreign key exists, even though it's set to "oncascade: delete"
  const garageRepo = await db.getRepository(Garage);
  await garageRepo.query('DELETE FROM public."Garage"');

  const vehicleRepo = await db.getRepository(Vehicle);
  await vehicleRepo.query('DELETE FROM public."Vehicle"');
});

describe('Bus garage operations', () => {
  it('Happy path - park and unpark a bus in 5 consecutive large spots', async () => {
    // this is the start of 5 consecutive large spots at the edge of the row
    const levelNum = 0;
    const rowNum = 2;
    const spotNum = 3;

    const { garageFactory, vehicleFact, garage, vehicle } = await testSingleVehicleParkingInSpot(VehicleType.Bus, levelNum, rowNum, spotNum, 36, 5);

    // now test that we can UNpark too (this validation holds regardless of spot type)
    // unpark the vehicle
    await vehicle.unpark();

    // and make sure that the vacant and occupied spots reflect accordingly
    const updatedFindResults = await garageFactory.findGarage({ name: garage.name, company: garage.company });
    expect(updatedFindResults.length).toBe(1);
    const garageWithUnParkedBus = updatedFindResults[0];
    const updatedVacantSpotsAgain = await garageWithUnParkedBus.getVacantSpots();
    const updatedOccupiedSpotsAgain = await garageWithUnParkedBus.getOccupiedSpots();
    expect(updatedVacantSpotsAgain.length).toBe(41);
    expect(updatedOccupiedSpotsAgain.length).toBe(0);

    // but since we haven't left garage yet, still should have a vehicle in the garage
    const vehiclesInGarage = await garageWithUnParkedBus.getAllVehiclesInGarage();
    expect(vehiclesInGarage.length).toBe(1);
  })

  it('Parking bus in only 3 consecutive large spots throws error', async () => {
    const levelNum = 1;
    const rowNum = 1;
    const spotNum = 3;

    let thereWasAProblem = false;

    try {
      await testSingleVehicleParkingInSpot(VehicleType.Bus, levelNum, rowNum, spotNum, 36, 5);
    }
    catch (err) {
      expect(err.message).toBe('Spot type CompactSpot not allowed for vehicle type Bus');
      thereWasAProblem = true;
    }

    // should have thrown an error
    expect(thereWasAProblem).toBe(true);
  })

  it('Parking bus too close to end of row throws error', async () => {
    const levelNum = 0;
    const rowNum = 1;
    const spotNum = 5;

    let thereWasAProblem = false;

    try {
      await testSingleVehicleParkingInSpot(VehicleType.Bus, levelNum, rowNum, spotNum, 36, 5);
    }
    catch (err) {
      // this would happen when the algorithm checks the "index 8" spot in the row, which doesn't exist
      // since there's only 8 rows 0-7.
      expect(err.message).toBe(`Spot number doesn't exist in requested row`);
      thereWasAProblem = true;
    }

    // should have thrown an error
    expect(thereWasAProblem).toBe(true);
  })
})


describe('Motorcycle garage operations', () => {
  it('Park and unpark a motorcycle from motorcycle spot', async () => {
    const levelNum = 1;
    const rowNum = 0;
    const spotNum = 6;

    const { garageFactory, vehicleFact, garage, vehicle } = await testSingleVehicleParkingInSpot(VehicleType.Motorcycle, levelNum, rowNum, spotNum, 40, 1);

    // now test that we can UNpark too (this validation holds regardless of spot type)
    // unpark the vehicle
    await vehicle.unpark();

    // and make sure that the vacant and occupied spots reflect accordingly
    const updatedFindResults = await garageFactory.findGarage({ name: garage.name, company: garage.company });
    expect(updatedFindResults.length).toBe(1);
    const garageWithUnParkedBike = updatedFindResults[0];
    const updatedVacantSpotsAgain = await garageWithUnParkedBike.getVacantSpots();
    const updatedOccupiedSpotsAgain = await garageWithUnParkedBike.getOccupiedSpots();
    expect(updatedVacantSpotsAgain.length).toBe(41);
    expect(updatedOccupiedSpotsAgain.length).toBe(0);

    // but since we haven't left garage yet, still should have a vehicle in the garage
    const vehiclesInGarage = await garageWithUnParkedBike.getAllVehiclesInGarage();
    expect(vehiclesInGarage.length).toBe(1);
  })

  it('Park a motorcycle in compact spot', async () => {
    const levelNum = 1;
    const rowNum = 1;
    const spotNum = 0;

    await testSingleVehicleParkingInSpot(VehicleType.Motorcycle, levelNum, rowNum, spotNum, 40, 1);
  })

  it('Park a motorcycle in large spot', async () => {
    const levelNum = 1;
    const rowNum = 1;
    const spotNum = 3;

    await testSingleVehicleParkingInSpot(VehicleType.Motorcycle, levelNum, rowNum, spotNum, 40, 1);
  })

  it('Make sure you cannot park a motorcycle in an occupied spot', async () => {
    const levelNum = 1;
    const rowNum = 1;
    const spotNum = 3;

    const { garageFactory, vehicleFact, garage, vehicle } = await testSingleVehicleParkingInSpot(VehicleType.Motorcycle, levelNum, rowNum, spotNum, 40, 1);

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
    const bike = await buildVehicle(vehicleFact, VehicleType.Motorcycle);

    const { fact, garage } = await createTestGarage();

    // enter garage
    await bike.enter(garage);

    // check that garage says there's a bus in it
    const findResults = await fact.findGarage({ name: garage.name, company: garage.company });
    expect(findResults.length).toBe(1);
    const vehiclesInGarage = await findResults[0].getAllVehiclesInGarage();
    expect(vehiclesInGarage.length).toBe(1);
    expect(vehiclesInGarage[0] instanceof Bus);
    expect(vehiclesInGarage[0].getLicensePlateNumber()).toBe(bike.getLicensePlateNumber());

    // leave garage
    await bike.leave();

    // check that garage is empty
    const findResultsLeave = await fact.findGarage({ name: garage.name, company: garage.company });
    expect(findResultsLeave.length).toBe(1);
    const hopefullyNoVehiclesInGarage = await findResultsLeave[0].getAllVehiclesInGarage();
    expect(hopefullyNoVehiclesInGarage.length).toBe(0);
  })

  // TODO edge cases
  // * check you can't enter another garage when you're already in one.
  // * check that you can't leave a garage when you're not in one.
  // * unit test where Garage.canFit is false (requires method implementation).
})

// most of the basic operations of enter, leave that are common to all vehicles 
// were already tested in the motorcycle ops test cases. here we'll just 
// focus on the logic specific to car (namely that it can't park in motorcycle spots)
describe('Car garage operations', () => {
  it('Park and unpark a car in compact spot', async () => {
    const levelNum = 1;
    const rowNum = 1;
    const spotNum = 0;

    const { garageFactory, vehicleFact, garage, vehicle } = await testSingleVehicleParkingInSpot(VehicleType.Car, levelNum, rowNum, spotNum, 40, 1);

    // now test that we can UNpark too (this validation holds regardless of spot type)
    // unpark the vehicle
    await vehicle.unpark();

    // and make sure that the vacant and occupied spots reflect accordingly
    const updatedFindResults = await garageFactory.findGarage({ name: garage.name, company: garage.company });
    expect(updatedFindResults.length).toBe(1);
    const garageWithUnParkedCar = updatedFindResults[0];
    const updatedVacantSpotsAgain = await garageWithUnParkedCar.getVacantSpots();
    const updatedOccupiedSpotsAgain = await garageWithUnParkedCar.getOccupiedSpots();
    expect(updatedVacantSpotsAgain.length).toBe(41);
    expect(updatedOccupiedSpotsAgain.length).toBe(0);

    // but since we haven't left garage yet, still should have a vehicle in the garage
    const vehiclesInGarage = await garageWithUnParkedCar.getAllVehiclesInGarage();
    expect(vehiclesInGarage.length).toBe(1);
  })

  it('Parking car in motorcycle spot should error', async () => {
    const levelNum = 1;
    const rowNum = 0;
    const spotNum = 6;

    let thereWasAProblem = false;

    try {
      await testSingleVehicleParkingInSpot(VehicleType.Car, levelNum, rowNum, spotNum, 40, 1);
    }
    catch (err) {
      expect(err.message).toBe('Spot type Motorcycle not allowed for vehicle type Car');
      thereWasAProblem = true;
    }

    // should have thrown an error
    expect(thereWasAProblem).toBe(true);
  })

  it('Park a car in large spot', async () => {
    const levelNum = 1;
    const rowNum = 1;
    const spotNum = 3;

    await testSingleVehicleParkingInSpot(VehicleType.Car, levelNum, rowNum, spotNum, 40, 1);
  })

  it('Make sure you cannot park a car in an occupied spot', async () => {
    const levelNum = 1;
    const rowNum = 1;
    const spotNum = 3;

    const { garageFactory, vehicleFact, garage, vehicle } = await testSingleVehicleParkingInSpot(VehicleType.Car, levelNum, rowNum, spotNum, 40, 1);

    const anotherVehicle = await buildVehicle(vehicleFact, VehicleType.Car);
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

    const findBikeResults = await fact.findVehicle({ licensePlateNumber: bike.getLicensePlateNumber(), state: bike.getState() });

    expect(findBikeResults.length).toBe(1);
    const foundBike = findBikeResults[0];
    expect(foundBike instanceof Motorcycle).toBeTruthy();
    validateVehicle(foundBike, bike);
  })

  it('Create and retrieve car', async () => {
    const fact = new VehicleFactory();
    const car = await buildVehicle(fact, VehicleType.Car);
    expect(car instanceof Car).toBeTruthy();

    const findResults = await fact.findVehicle({ licensePlateNumber: car.getLicensePlateNumber(), state: car.getState() });

    expect(findResults.length).toBe(1);
    const foundCar = findResults[0];
    expect(foundCar instanceof Car).toBeTruthy();
    validateVehicle(foundCar, car);
  })

  it('Create and retrieve bus', async () => {
    const fact = new VehicleFactory();
    const bus = await buildVehicle(fact, VehicleType.Bus);
    expect(bus instanceof Bus).toBeTruthy();

    const findResults = await fact.findVehicle({ licensePlateNumber: bus.getLicensePlateNumber(), state: bus.getState() });

    expect(findResults.length).toBe(1);
    const foundBus = findResults[0];
    expect(foundBus instanceof Bus).toBeTruthy();
    validateVehicle(foundBus, bus);
  })
})


