import { VehicleType } from '../src/entities/VehicleType';
import { buildVehicle, testSingleVehicleParkingInSpot } from './TestCommon';


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