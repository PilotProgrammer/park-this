
import { Column, Entity, OneToMany } from 'typeorm';
import { ParkThisBaseEntity } from './ParkThisBaseEntity';
import { Level } from './Level';
import { VehicleType } from './VehicleType';
import { Vehicle } from './Vehicle';
import { getDbConnection } from '../utility/getDbConnection';
import { IVehicle } from '../vehicles/IVehicle';
import { VehicleFactory } from '../factory/VehicleFactory';

@Entity("Garage")
export class Garage extends ParkThisBaseEntity {

    @Column({ type: "citext"})
    public name!: string;


    public getName(): string {
        return this.name;
    }

    @OneToMany(type => Level, level => level.garage, { cascade: true })
    public levels!: Level[];

    @OneToMany(type => Vehicle, vehicle => vehicle.garage, { cascade: true })
    public vehicles!: Vehicle[];

    @Column({ type: "citext"})
    public company!: string;

    @Column({ type: "citext"})
    public streetAddress!: string;

    @Column({ type: "citext"})
    public city!: VehicleType;

    @Column({ type: "citext"})
    public state!: VehicleType;

    @Column({ type: "citext"})
    public postalCode!: VehicleType;

    public async canFit(vehicle: IVehicle) {
        // TODO make sure that garage can FIT this, meaning there's actually space
        // need to consider all vehicles that are parked in a apot, as well as those 
        // just "driving around" in garage but not parked yet.
        // there's no sense in letting a vehicle into the garage if the sum total
        // of all the other parted vehicles, plus the total vehicles already driving
        // around in the garage, is at or above the capacity of the garage itself.
        return true;
    }

    public async getAllVehiclesInGarage() {
        const fact = new VehicleFactory();
        return await fact.databaseVehiclesToDomainModel(this.vehicles);
    }

    public async getVacantSpots() {
        const occupiedFilter = false;    
        const collectedSpots = this.collectSpots(occupiedFilter);
        return collectedSpots;
    }

    private collectSpots(occupiedFilter: boolean) {
        let collectedSpots: SpotDefinition[] = [];

        // go through each level, row, and spot of the garage.
        // if a spot is empty, then add to vacant spots
        this.levels.forEach(level => {
            level.rows.forEach(row => {
                // filter out vacant spots
                const spotDefinitions = row.spots.filter(spot => {
                    if (occupiedFilter == true) {
                        return spot.occupyingVehicle != null ? true : false;
                    } else {
                        return spot.occupyingVehicle == null ? true : false;
                    }
                    // map to spot definition to flattent the hierarchy.
                }).map(spot => {
                    const spotDefinition: SpotDefinition = {
                        level: level.levelNumber,
                        row: row.rowNumber,
                        spot: spot.spotNumber
                    };

                    // const returnDef = (spot.occupyingVehicle != null) ? spotDefinition : null
                    return spotDefinition;
                });

                collectedSpots = collectedSpots.concat(spotDefinitions);
            });
        });
        return collectedSpots;
    }

    public async getOccupiedSpots() {
        const occupiedFilter = true;    
        const collectedSpots = this.collectSpots(occupiedFilter);
        return collectedSpots;
    }
}

export type SpotDefinition = {
    level: number,
    row: number,
    spot: number
}