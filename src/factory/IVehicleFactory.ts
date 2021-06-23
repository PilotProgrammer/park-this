import { EntityManager } from 'typeorm';
import { Vehicle } from '../entities/Vehicle';
import { VehicleType } from '../entities/VehicleType';
import { getDbConnection } from '../utility/getDbConnection';
import { Bus } from '../vehicles/Bus';
import { Car } from '../vehicles/Car';
import { IVehicle } from '../vehicles/IVehicle';
import { Motorcycle } from '../vehicles/Motorcycle';
import { BuildVehicleRequest, SearchVehicleRequest } from './VehicleFactory';



export interface IVehicleFactory {

  buildVehicle(request: BuildVehicleRequest): Promise<IVehicle>;
  findVehicle(searchParams: SearchVehicleRequest): Promise<IVehicle[]>;
  databaseVehiclesToDomainModel(result: IVehicle[]): Promise<IVehicle[]>;
  
}