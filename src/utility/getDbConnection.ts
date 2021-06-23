import { ConsecutiveRow } from "../entities/ConsecutiveRow";
import { Garage } from "../entities/Garage";
import { Level } from "../entities/Level";
import { Spot } from "../entities/Spot";
import { Vehicle } from "../entities/Vehicle";
import { Connection, createConnection, EntityManager, getConnection, getConnectionManager } from "typeorm";

const connectionName = "default";

export const getDbConnection = async () => {
  const connectionManager = getConnectionManager();

  if (connectionManager.has(connectionName) === true) {
    const connection = await getConnection(connectionName);
    return connection;
  } else {
    const connection = await connectionManager.create({
      name: connectionName,
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

    return (await connection.connect());
  }
}