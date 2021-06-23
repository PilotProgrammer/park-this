import { getDbConnection } from "../utility/getDbConnection";
import { EntityManager } from "typeorm";
import { Garage } from "../entities/Garage";
import { Spot } from "../entities/Spot";
import { Vehicle } from "../entities/Vehicle";
import { IVehicle } from "./IVehicle";
import { SpotType } from "../entities/SpotType";

export class Motorcycle extends Vehicle implements IVehicle {
 
  protected spotsRequiredForVehicle(): number {
    return 1;
  }

  protected spotTypesAllowedForVehicle(): Array<SpotType> {
    return [ SpotType.LargeSpot, SpotType.CompactSpot, SpotType.MotorcycleSpot ];
  }
  
}