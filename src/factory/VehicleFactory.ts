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

    // vehicle.spots = [];
    // vehicle.garage = null;

    return vehicle;
  }

  public async findVehicle(searchParams: SearchVehicleRequest) {
    const repo = (await getDbConnection()).getRepository(Vehicle);
    const result = await repo.find({
      where: searchParams,
      relations: ['spots', 'garage']
    });

    const vehicles = await this.databaseVehiclesToDomainModel(result);

    return vehicles;
  }

  public async databaseVehiclesToDomainModel(result: Vehicle[]) {
    const vehicles = result.map((fromVehicle) => {
      let toVehicle: IVehicle;

      switch (fromVehicle.vehicleType) {
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

      // if (toVehicle.spots == null) {
      //   toVehicle.spots = [];
      // }

      return toVehicle;
    });

    return vehicles;
  }
}