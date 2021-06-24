import { IVehicle } from '../vehicles/IVehicle';
import { BuildVehicleRequest, SearchVehicleRequest } from './VehicleFactory';

export interface IVehicleFactory {

  buildVehicle(request: BuildVehicleRequest): Promise<IVehicle>;
  findVehicle(searchParams: SearchVehicleRequest): Promise<IVehicle[]>;
  databaseVehiclesToDomainModel(result: IVehicle[]): Promise<IVehicle[]>;
  
}