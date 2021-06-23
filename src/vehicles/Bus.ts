import { Garage } from "../entities/Garage";
import { Spot } from "../entities/Spot";
import { Vehicle } from "../entities/Vehicle";
import { IVehicle } from "./IVehicle";

export class Bus extends Vehicle implements IVehicle {
  async park(garage: Garage, levelNum: number, rowNum: number, spotNum: number): Promise<boolean> {
    return false;
  }

  async unpark(): Promise<boolean> {
    return false;
  }
}