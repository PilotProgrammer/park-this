import { SpotType } from "../entities/SpotType";
import { Vehicle } from "../entities/Vehicle";
import { IVehicle } from "./IVehicle";

export class Car extends Vehicle implements IVehicle {

  protected spotsRequiredForVehicle(): number {
    return 1;
  }

  protected spotTypesAllowedForVehicle(): Array<SpotType> {
    return [ SpotType.LargeSpot, SpotType.CompactSpot ];
  }
  
}