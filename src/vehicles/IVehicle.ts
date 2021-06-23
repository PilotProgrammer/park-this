import { Garage } from "../entities/Garage";
import { Spot } from "../entities/Spot";

export interface IVehicle {
  enter(garage: Garage): Promise<boolean>;
  leave(): Promise<boolean>;
  park(garage: Garage, levelNum: number, rowNum: number, spotNum: number): Promise<boolean>;
  unpark(): Promise<boolean>;

  name?: string;

  color?: string;

  licensePlateNumber: string;

  state: string;

  spots?: Spot[];

  garage?: Garage;

}