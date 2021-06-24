import { SpotType } from "../entities/SpotType";
import { Vehicle } from "../entities/Vehicle";
import { IVehicle } from "./IVehicle";

export class Bus extends Vehicle implements IVehicle {
  protected spotsRequiredForVehicle(): number {
    return 5;
  }

  protected spotTypesAllowedForVehicle(): Array<SpotType> {
    return [ SpotType.LargeSpot ];
  }
}