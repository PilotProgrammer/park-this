import {getConnectionManager, ConnectionManager, Connection} from "typeorm";

import { ConsecutiveRow } from "./entities/ConsecutiveRow";
import { Garage } from "./entities/Garage";
import { Level } from "./entities/Level";
import { Spot } from "./entities/Spot";
import { Vehicle } from "./entities/Vehicle";

export const connectFromLocal = async() => {
  const connectionManager = getConnectionManager();
  const connection = connectionManager.create({
      type: "postgres",
      host: "localhost",
      port: 5432,
      username: "user",
      password: "pass",
      database: "ParkThis",
      entities: [
        ConsecutiveRow,
        Garage,
        Level,
        Spot,
        Vehicle
      ]
  });

  return connection.connect(); // performs connection  
}

export {
  ConsecutiveRow,
  Garage,
  Level,
  Spot,
  Vehicle
}
