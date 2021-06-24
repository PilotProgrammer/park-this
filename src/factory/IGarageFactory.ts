import { Garage } from '../entities/Garage';
import { SpotType } from '../entities/SpotType';
import { PlannedGarageRequest, SearchGarageRequest } from './GarageFactory';

export interface IGarageFactory {
  planGarage(request: PlannedGarageRequest): Garage;
  addLevel(garage: Garage): void;
  addRow(garage: Garage, level: BigInt): void;
  addSpot(garage: Garage, level: BigInt, row: BigInt, spotType: SpotType): void;
  buildGarage(garage: Garage): void;
  findGarage(searchParams: SearchGarageRequest): Promise<Garage[]>;
}