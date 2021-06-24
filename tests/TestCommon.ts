import { Garage, GarageFactory, Vehicle, VehicleFactory } from '../src';
import { SpotType } from '../src/entities/SpotType';
import { VehicleType } from '../src/entities/VehicleType';
import { IVehicle } from '../src/vehicles/IVehicle';
import { AppContext } from '../src/app/AppContext';
import { IGarageFactory } from '../src/factory/IGarageFactory';
import { IVehicleFactory } from '../src/factory/IVehicleFactory';
import { getDbConnection } from '../src/utility/getDbConnection';
var Fakerator = require("fakerator");

export const fakerator = Fakerator("en-AU"); // cuz there's not one for en-US


export async function createTestGarage() {
  const factory: IGarageFactory = AppContext.getGarageFactory()
  const garage = factory.planGarage({
    name: fakerator.names.firstName(),
    company: fakerator.names.firstName(),
    streetAddress: fakerator.address.street(),
    city: fakerator.address.city(),
    state: fakerator.names.firstName(),
    postalCode: fakerator.address.postCode()
  });

  // add 2 levels
  factory.addLevel(garage);
  factory.addLevel(garage);

  // add 3 rows to level 0
  factory.addRow(garage, BigInt(0));
  factory.addRow(garage, BigInt(0));
  factory.addRow(garage, BigInt(0));

  // add 2 rows to level 1 
  factory.addRow(garage, BigInt(1));
  factory.addRow(garage, BigInt(1));

  // add spots to level 0 row 1 - 8 spots
  factory.addSpot(garage, BigInt(0), BigInt(0), SpotType.CompactSpot);
  factory.addSpot(garage, BigInt(0), BigInt(0), SpotType.CompactSpot);
  factory.addSpot(garage, BigInt(0), BigInt(0), SpotType.CompactSpot);
  factory.addSpot(garage, BigInt(0), BigInt(0), SpotType.MotorcycleSpot);
  factory.addSpot(garage, BigInt(0), BigInt(0), SpotType.MotorcycleSpot);
  factory.addSpot(garage, BigInt(0), BigInt(0), SpotType.LargeSpot);
  factory.addSpot(garage, BigInt(0), BigInt(0), SpotType.LargeSpot);
  factory.addSpot(garage, BigInt(0), BigInt(0), SpotType.LargeSpot);

  // add spots to level 0 row 2 - 8 spots
  factory.addSpot(garage, BigInt(0), BigInt(1), SpotType.MotorcycleSpot);
  factory.addSpot(garage, BigInt(0), BigInt(1), SpotType.MotorcycleSpot);
  factory.addSpot(garage, BigInt(0), BigInt(1), SpotType.LargeSpot);
  factory.addSpot(garage, BigInt(0), BigInt(1), SpotType.LargeSpot);
  factory.addSpot(garage, BigInt(0), BigInt(1), SpotType.LargeSpot);
  factory.addSpot(garage, BigInt(0), BigInt(1), SpotType.LargeSpot);
  factory.addSpot(garage, BigInt(0), BigInt(1), SpotType.LargeSpot);
  factory.addSpot(garage, BigInt(0), BigInt(1), SpotType.LargeSpot);

  // add spots to level 0 row 3 - 10 spots
  factory.addSpot(garage, BigInt(0), BigInt(2), SpotType.LargeSpot);
  factory.addSpot(garage, BigInt(0), BigInt(2), SpotType.LargeSpot);
  factory.addSpot(garage, BigInt(0), BigInt(2), SpotType.LargeSpot);
  factory.addSpot(garage, BigInt(0), BigInt(2), SpotType.LargeSpot);
  factory.addSpot(garage, BigInt(0), BigInt(2), SpotType.LargeSpot);
  factory.addSpot(garage, BigInt(0), BigInt(2), SpotType.LargeSpot);
  factory.addSpot(garage, BigInt(0), BigInt(2), SpotType.LargeSpot);
  factory.addSpot(garage, BigInt(0), BigInt(2), SpotType.LargeSpot);
  factory.addSpot(garage, BigInt(0), BigInt(2), SpotType.LargeSpot);
  factory.addSpot(garage, BigInt(0), BigInt(2), SpotType.LargeSpot);

  // add spots to level 1 row 0 - 7 spots
  factory.addSpot(garage, BigInt(1), BigInt(0), SpotType.MotorcycleSpot);
  factory.addSpot(garage, BigInt(1), BigInt(0), SpotType.MotorcycleSpot);
  factory.addSpot(garage, BigInt(1), BigInt(0), SpotType.MotorcycleSpot);
  factory.addSpot(garage, BigInt(1), BigInt(0), SpotType.MotorcycleSpot);
  factory.addSpot(garage, BigInt(1), BigInt(0), SpotType.MotorcycleSpot);
  factory.addSpot(garage, BigInt(1), BigInt(0), SpotType.MotorcycleSpot);
  factory.addSpot(garage, BigInt(1), BigInt(0), SpotType.MotorcycleSpot);

  // add spots to level 1 row 1 - 8 spots
  factory.addSpot(garage, BigInt(1), BigInt(1), SpotType.CompactSpot);
  factory.addSpot(garage, BigInt(1), BigInt(1), SpotType.CompactSpot);
  factory.addSpot(garage, BigInt(1), BigInt(1), SpotType.CompactSpot);
  factory.addSpot(garage, BigInt(1), BigInt(1), SpotType.LargeSpot);
  factory.addSpot(garage, BigInt(1), BigInt(1), SpotType.LargeSpot);
  factory.addSpot(garage, BigInt(1), BigInt(1), SpotType.LargeSpot);
  factory.addSpot(garage, BigInt(1), BigInt(1), SpotType.CompactSpot);
  factory.addSpot(garage, BigInt(1), BigInt(1), SpotType.CompactSpot);

  await factory.buildGarage(garage);
  return { fact: factory, garage };
}

export function validateVehicle(foundVehicle: IVehicle, originalVehicle: IVehicle) {
  expect(foundVehicle.getColor()).toBe(originalVehicle.getColor());
  expect(foundVehicle.getName()).toBe(originalVehicle.getName());
  expect(foundVehicle.getLicensePlateNumber()).toBe(originalVehicle.getLicensePlateNumber());
  expect(foundVehicle.getState()).toBe(originalVehicle.getState());
}

export async function buildVehicle(fact: VehicleFactory, type: VehicleType) {
  return await fact.buildVehicle({
    vehicleType: type,
    color: 'red',
    name: fakerator.names.firstName(),
    licensePlateNumber: fakerator.internet.color(),
    state: fakerator.names.firstName(),
  });
}

export async function testSingleVehicleParkingInSpot(vehicleType: VehicleType, levelNum: number,
  rowNum: number, spotNum: number, expectedVacantSpotsAfterParking: number,
  expectedOccupiedSpotsAfterParking: number) {

  const vehicleFact: IVehicleFactory = AppContext.getVehicleFactory();
  const vehicle = await buildVehicle(vehicleFact, vehicleType);

  const { fact: garageFactory, garage } = await createTestGarage();
  const vacantSpots = await garage.getVacantSpots();
  const occupiedSpots = await garage.getOccupiedSpots();
  // test garage has 41 calls to .addSpot()
  expect(vacantSpots.length).toBe(41);
  expect(occupiedSpots.length).toBe(0);

  await vehicle.enter(garage);
  await vehicle.park(garage, levelNum, rowNum, spotNum);

  // reaquire garage after vehicle entered and parked
  const findResults = await garageFactory.findGarage({ name: garage.name, company: garage.company });
  expect(findResults.length).toBe(1);
  const garageWithVehicle = findResults[0];
  const updatedVacantSpots = await garageWithVehicle.getVacantSpots();
  const updatedOccupiedSpots = await garageWithVehicle.getOccupiedSpots();
  expect(updatedVacantSpots.length).toBe(expectedVacantSpotsAfterParking);
  expect(updatedOccupiedSpots.length).toBe(expectedOccupiedSpotsAfterParking);

  return { garageFactory, vehicleFact, garage, vehicle }
}

export async function cleanDatabase() {
  const db = await getDbConnection();
  // .clear() translates to "truncate", and doens't work in postgres because foreign key exists, even though it's set to "oncascade: delete"
  const garageRepo = await db.getRepository(Garage);
  await garageRepo.query('DELETE FROM public."Garage"');

  const vehicleRepo = await db.getRepository(Vehicle);
  await vehicleRepo.query('DELETE FROM public."Vehicle"');

}