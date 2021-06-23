import { GarageFactory } from "../factory/GarageFactory";
import { IGarageFactory } from "../factory/IGarageFactory";
import { IVehicleFactory } from "../factory/IVehicleFactory";
import { VehicleFactory } from "../factory/VehicleFactory";

export class AppContext {
  private static garageFactory: IGarageFactory;
  private static vehicleFactory: IVehicleFactory;

  public static getGarageFactory(): IGarageFactory {
    if (this.garageFactory == null)
      this.garageFactory = new GarageFactory();

    return this.garageFactory;
  }

  public static getVehicleFactory(): IVehicleFactory {
    if (this.vehicleFactory == null)
      this.vehicleFactory = new VehicleFactory();

    return this.vehicleFactory;
  }
}