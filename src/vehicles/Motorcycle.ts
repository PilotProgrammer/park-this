import { Spot } from "../entities/Spot";
import { Vehicle } from "../entities/Vehicle";
import { IVehicle } from "./IVehicle";

export class Motorcycle extends Vehicle implements IVehicle {
  park(spot: Spot): boolean {
    return false;
  }

  unpark(): boolean {
    return false;
  }
}