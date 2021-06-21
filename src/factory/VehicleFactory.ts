import { EntityManager } from 'typeorm';
import { Garage } from '../entities/Garage';
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

  public async buildVehicle(request: BuildVehicleRequest): Promise<IVehicle> {
    let vehicle: IVehicle;

    switch (request.vehicleType) {
      case VehicleType.Motorcycle:
        vehicle = new Motorcycle();
        break;
      case VehicleType.Automobile:
        vehicle = new Car();
        break;
      case VehicleType.Bus:
        vehicle = new Bus();
        break; 
    }

    // const garage = new Garage();
    vehicle = Object.assign(vehicle, request)

    await (await getDbConnection()).transaction(async (db: EntityManager) => {
      const repo = db.getRepository(Vehicle);
      await repo.save(vehicle);
    })

    // assignedGarage.levels = new Array<Level>(); // TODO array of interfaces
    return vehicle;
  }

  public async findVehicle(searchParams: SearchVehicleRequest) {
    const repo = (await getDbConnection()).getRepository(Garage);
    const result = await repo.find({
      where: searchParams,
      relations: ['spots', 'levels.rows', 'levels.rows.spots']
    });

    return result;
  }
}