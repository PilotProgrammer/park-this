import { Garage } from "../entities/Garage";
import { Spot } from "../entities/Spot";

export interface IVehicle {
  enter(garage: Garage): Promise<boolean>;
  leave(): Promise<boolean>;
  park(spot: Spot): Promise<boolean>;
  unpark(): Promise<boolean>;

  name?: string;

  color?: string;

  licensePlateNumber: string;

  state: string;

  spots?: Spot[];

  garage?: Garage;

}