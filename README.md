# park-this
iPark and ParkMe were already taken, so this was the 3rd choice. "Real time" parking garage based on a code challenge.

Start Postgre docker container
```
npm run docker-init
```

With fresh local Postgres docker, next we need to get the database tables created
``` 
npm run typeorm migration:run
```

To generate DDL change after updating db TS entities (compares what's in 'entities' directory to existing local database and generates "migration" SQL)
```
npm run typeorm migration:generate -- -n migrationNameHere
```