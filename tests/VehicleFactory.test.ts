
import { AppContext } from '../src/app/AppContext';
import { VehicleType } from '../src/entities/VehicleType';
import { IVehicleFactory } from '../src/factory/IVehicleFactory';
import { Bus } from '../src/vehicles/Bus';
import { Car } from '../src/vehicles/Car';
import { Motorcycle } from '../src/vehicles/Motorcycle';
import { buildVehicle, validateVehicle } from './TestCommon';


describe('VehicleFactory tests', () => {

  it('Create and retrieve bike', async () => {
    const fact: IVehicleFactory = AppContext.getVehicleFactory();
    const bike = await buildVehicle(fact, VehicleType.Motorcycle);
    expect(bike instanceof Motorcycle).toBeTruthy();

    const findBikeResults = await fact.findVehicle({ licensePlateNumber: bike.getLicensePlateNumber(), state: bike.getState() });

    expect(findBikeResults.length).toBe(1);
    const foundBike = findBikeResults[0];
    expect(foundBike instanceof Motorcycle).toBeTruthy();
    validateVehicle(foundBike, bike);
  })

  it('Create and retrieve car', async () => {
    const fact: IVehicleFactory = AppContext.getVehicleFactory();
    const car = await buildVehicle(fact, VehicleType.Car);
    expect(car instanceof Car).toBeTruthy();

    const findResults = await fact.findVehicle({ licensePlateNumber: car.getLicensePlateNumber(), state: car.getState() });

    expect(findResults.length).toBe(1);
    const foundCar = findResults[0];
    expect(foundCar instanceof Car).toBeTruthy();
    validateVehicle(foundCar, car);
  })

  it('Create and retrieve bus', async () => {
    const fact: IVehicleFactory = AppContext.getVehicleFactory();
    const bus = await buildVehicle(fact, VehicleType.Bus);
    expect(bus instanceof Bus).toBeTruthy();

    const findResults = await fact.findVehicle({ licensePlateNumber: bus.getLicensePlateNumber(), state: bus.getState() });

    expect(findResults.length).toBe(1);
    const foundBus = findResults[0];
    expect(foundBus instanceof Bus).toBeTruthy();
    validateVehicle(foundBus, bus);
  })
})


