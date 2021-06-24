
import { assert } from 'console';
import { Connection, EntityManager, getConnection, getConnectionManager, QueryRunner, TreeChildren } from 'typeorm';

import { ConsecutiveRow, Garage, Level, Spot, Vehicle, VehicleFactory } from '../src'
import { AppContext } from '../src/app/AppContext';
import { VehicleType } from '../src/entities/VehicleType';
import { IVehicleFactory } from '../src/factory/IVehicleFactory';
import { getDbConnection } from '../src/utility/getDbConnection';
import { Bus } from '../src/vehicles/Bus';
import { Car } from '../src/vehicles/Car';
import { Motorcycle } from '../src/vehicles/Motorcycle';
import { createTestGarage, buildVehicle, validateVehicle, testSingleVehicleParkingInSpot, cleanDatabase } from './TestCommon';

beforeAll(async () => {
  await cleanDatabase();
});

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
    const vehicleFact: IVehicleFactory = AppContext.getVehicleFactory();
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