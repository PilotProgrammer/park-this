import { SpotType } from "../entities/SpotType";
import { getDbConnection } from "../utility/getDbConnection";
import { EntityManager } from "typeorm";
import { Garage } from "../entities/Garage";
import { Spot } from "../entities/Spot";
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