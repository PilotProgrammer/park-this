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
