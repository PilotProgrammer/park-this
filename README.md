# park-this

## Intro
iPark and ParkMe were already taken, so ParkThis was a good 3rd choice. "Real time" parking garage based on a code challenge.

** "motorcycle" and "bike" are used interchangeably in the code

Rules of the game:
1. The parking garage has multiple levels. Each level has multiple rows of spots.
2. The parking garage can park motorcycles, cars, and buses.
3. The parking garage has motorcycle spots, compact spots, and large spots.
4. A motorcycle can park in any spot.
5. A car can park in either a single compact spot or a single large spot.
6. A bus can park in five large spots that are consecutive and within the same row. It cannot
park in small spots.

This project uses TypeScript, TypeORM for interacting with a PostgreSQL database running in a docker container, and Jest for tests.

## How to run
Start Postgre docker container:
```
npm run docker-init
```

With fresh local Postgres docker, next we need to get the database tables created:
``` 
npm run typeorm migration:run
```

If you happened to need to change the databaes, to generate DDL change after updating db TS entities (compares what's in 'entities' directory to existing local database and generates "migration" SQL), run this command and then run migration:run above:
```
npm run typeorm migration:generate -- -n migrationNameHere
```

Run the unit tests:
```
npm run test
```

## More details
Most of the business logic resides in the Vehicle class. There are 3 subclasses of that abstract base: Bus, Car, Motorcycle.

Each vehicle can enter/leave a garage or park/unpark from a spot (public methods on Vehicle class itself, subclasses are fairy lightweight, just providing the # spots and the type of spot that the vehicle has to occupy when parked).

The data structure for the Garage is: Garage has many levels... level has many rows... rows have many spots... and each spot can have an "occupying vehicle" or not. The garage also can have a vehicle that has entered, but not yet parked, so Garage::getAllVehiclesInGarage may return something, but Garage::getOccupiedSpots returns *nothing*. Only after the vehicle enters AND parks will Garage::getAllVehiclesInGarage and Garage::getOccupiedSpots both have the given vehicle.

## Future cleanup and enhancements
* There are a few remaining minor edge cases to test for (as noted by TODO in the test case files).
* The classes in "entities" folder *should* have all the properties set as private. Due to a limitation with TypeORM, these properties need to be public. BUT, the persistenace classes and the associated "domain logic" / layer should be separated, whereas now they are not.
* There is a stub method that needs implementation for Garage::canFit, which based on the current occupancy of the garage, would indicate whether a candidate vehicle will fit in the garage. 
* More consideration needs to be given to database locking and transactions, as this app would likely face concurrency issues if, e.g. two cars try to enter the garage at the same time, but Garage::canFit would return false if both were actually IN the garage -- i.e. only one could fit and they both tried to race into the garage simultaneously.
* Mutable garage. Right now after you buildGarage(), it’s immutable -- can't hire a construction crew to build more levels.
* Metered parking - discounts based on longer duration, day pass, etc. each vehicle has a “customer” with “billingdata” and “users” and “roles”.
* Multiple companies with multiple parking garages.

## References
The following items came in handy, in part or in whole, during the creation of this project:

### Postgres on docker

 https://docs.npmjs.com/specifying-dependencies-and-devdependencies-in-a-package-json-file

https://medium.com/@rcuni8/create-expressjs-server-with-typeorm-and-postgres-using-docker-and-docker-compose-66f1ebc9d94b

https://docs.docker.com/compose/gettingstarted/

https://hub.docker.com/_/postgres?tab=description&page=1&ordering=last_updated

https://towardsdatascience.com/how-to-run-postgresql-using-docker-15bf87b452d4

https://askubuntu.com/questions/720784/how-to-install-latest-node-inside-a-docker-container

### Typeorm:

https://github.com/typeorm/typeorm/blob/master/docs/using-ormconfig.md

https://medium.com/swlh/how-to-configure-a-backend-project-with-typescript-typeorm-and-postgresql-4a2be0e72da3

https://typeorm.io/#/connection-options/postgres--cockroachdb-connection-options

https://github.com/typeorm/typeorm/blob/master/docs/using-cli.md

https://github.com/typeorm/typeorm/blob/master/docs/migrations.md

https://orkhan.gitbook.io/typeorm/docs/many-to-one-one-to-many-relations

https://typeorm.io/#/active-record-data-mapper/what-is-the-active-record-pattern

https://github.com/typeorm/typeorm/issues/5676

https://orkhan.gitbook.io/typeorm/docs/transactions

https://orkhan.gitbook.io/typeorm/docs/connection-api

https://github.com/typeorm/typeorm/blob/master/docs/select-query-builder.md

https://typeorm.io/#/active-record-data-mapper/what-is-the-active-record-pattern

https://hackernoon.com/database-concurrencies-with-typeorm-6b1631k8 

https://github.com/typeorm/typeorm/blob/master/test/functional/query-builder/locking/query-builder-locking.ts 

https://stackoverflow.com/questions/57881960/typeorm-how-to-run-select-for-update-inside-queryrunner 

https://stackoverflow.com/questions/1657124/whats-the-difference-between-pessimistic-read-and-pessimistic-write-in-jpa

### Misc:

https://www.npmjs.com/package/fakerator


