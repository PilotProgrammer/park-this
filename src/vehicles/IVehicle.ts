import { Garage } from "../entities/Garage";
import { Spot } from "../entities/Spot";

export interface IVehicle {
  enter(garage: Garage): boolean;
  leave(): boolean;
  park(spot: Spot): boolean;
  unpark(): boolean;

  name?: string;

  color?: string;

  licensePlateNumber: string;

  state: string;

  spots?: Spot[];

  garage?: Garage;

}