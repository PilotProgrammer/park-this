# park-this
iPark and ParkMe were already taken, so ParkThis was a good 3rd choice. "Real time" parking garage based on a code challenge.

Rules of the game:
1. The parking garage has multiple levels. Each level has multiple rows of spots.
2. The parking garage can park motorcycles, cars, and buses.
3. The parking garage has motorcycle spots, compact spots, and large spots.
4. A motorcycle can park in any spot.
5. A car can park in either a single compact spot or a single large spot.
6. A bus can park in five large spots that are consecutive and within the same row. It cannot
park in small spots.

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