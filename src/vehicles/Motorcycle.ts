import { Spot } from "../entities/Spot";
import { Vehicle } from "../entities/Vehicle";
import { IVehicle } from "./IVehicle";

export class Motorcycle extends Vehicle implements IVehicle {
  async park(spot: Spot): Promise<boolean> {
    return false;
  }

  async unpark(): Promise<boolean> {
    return false;
  }
}