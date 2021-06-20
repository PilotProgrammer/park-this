import { getConnectionManager, getConnection } from "typeorm";

import { ConsecutiveRow } from "./entities/ConsecutiveRow";
import { Garage } from "./entities/Garage";
import { Level } from "./entities/Level";
import { Spot } from "./entities/Spot";
import { Vehicle } from "./entities/Vehicle";

export const connectFromLocal = async () => {
  const connectionManager = getConnectionManager();

  if (connectionManager.has('default') === true) {
    return getConnection('default');
  } else {
    const connection = connectionManager.create({
      name: "default",
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

    return connection.connect();
  }
}

export {
  ConsecutiveRow,
  Garage,
  Level,
  Spot,
  Vehicle
}
