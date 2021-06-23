import { GarageFactory, VehicleFactory } from '../src';
import { SpotType } from '../src/entities/SpotType';
import { VehicleType } from '../src/entities/VehicleType';
import { IVehicle } from '../src/vehicles/IVehicle';
import { fakerator } from './index.test';

export async function createTestGarage() {
  const fact = new GarageFactory();
  const garage = fact.planGarage({
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
  return { fact, garage };
}

export function validateVehicle(foundVehicle: IVehicle, originalVehicle: IVehicle) {
  expect(foundVehicle.color).toBe(originalVehicle.color);
  expect(foundVehicle.name).toBe(originalVehicle.name);
  expect(foundVehicle.licensePlateNumber).toBe(originalVehicle.licensePlateNumber);
  expect(foundVehicle.state).toBe(originalVehicle.state);
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

export async function testSingleVehicleParkingInSpot(levelNum: number, rowNum: number, spotNum: number) {
  const vehicleFact = new VehicleFactory();
  const vehicle = await buildVehicle(vehicleFact, VehicleType.Motorcycle);

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
  const garageWithBike = findResults[0];
  const updatedVacantSpots = await garageWithBike.getVacantSpots();
  const updatedOccupiedSpots = await garageWithBike.getOccupiedSpots();
  expect(updatedVacantSpots.length).toBe(40);
  expect(updatedOccupiedSpots.length).toBe(1);

  return { garageFactory, vehicleFact, garage, vehicle }
}