import { EntityManager } from 'typeorm';
import { Vehicle } from '../entities/Vehicle';
import { VehicleType } from '../entities/VehicleType';
import { getDbConnection } from '../utility/getDbConnection';
import { Bus } from '../vehicles/Bus';
import { Car } from '../vehicles/Car';
import { IVehicle } from '../vehicles/IVehicle';
import { Motorcycle } from '../vehicles/Motorcycle';

export type BuildVehicleRequest = {
  vehicleType: VehicleType, licensePlateNumber: string, state: string, name?: string, color?: string
}

export type SearchVehicleRequest = { licensePlateNumber: string, state: string }

export class VehicleFactory {

  // build vehicle with specs provided in BuildVehicleRequest, and save to database
  // returns instance of IVehicle where backing class depends on vehicle type 
  // specified in BuildVehicleRequest.
  public async buildVehicle(request: BuildVehicleRequest): Promise<IVehicle> {
    let vehicle: IVehicle;

    switch (request.vehicleType) {
      case VehicleType.Motorcycle:
        vehicle = new Motorcycle();
        break;
      case VehicleType.Car:
        vehicle = new Car();
        break;
      case VehicleType.Bus:
        vehicle = new Bus();
        break;
    }

    vehicle = Object.assign(vehicle, request)

    await (await getDbConnection()).transaction(async (db: EntityManager) => {
      const repo = db.getRepository(Vehicle);
      await repo.save(vehicle);
    })

    return vehicle;
  }

  // get list of IVehicle instances from database matching SearchVehicleRequest criteria
  public async findVehicle(searchParams: SearchVehicleRequest) {
    const repo = (await getDbConnection()).getRepository(Vehicle);
    const result = await repo.find({
      where: searchParams,
      relations: ['spots', 'garage']
    });

    const vehicles = await this.databaseVehiclesToDomainModel(result);

    return vehicles;
  }

  // convert generic database vehicle list to appropriate instances of IVehicle 
  // this is also used in Garage to convert the referenced array of database vehicles to the 
  // appropriate IVehicle instance. arguably this is not good architeture and needs to be fixed
  // when truly isolating the domain layer from the persistance layer/entities
  public async databaseVehiclesToDomainModel(result: Vehicle[]) {
    const vehicles = result.map((fromVehicle) => {
      let toVehicle: IVehicle;

      switch (fromVehicle.getVehicleType()) {
        case VehicleType.Motorcycle:
          toVehicle = new Motorcycle();
          break;
        case VehicleType.Car:
          toVehicle = new Car();
          break;
        case VehicleType.Bus:
          toVehicle = new Bus();
          break;
      }

      toVehicle = Object.assign(toVehicle, fromVehicle);

      return toVehicle;
    });

    return vehicles;
  }
}