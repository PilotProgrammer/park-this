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
