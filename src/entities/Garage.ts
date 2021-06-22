
import { Column, Entity, OneToMany } from 'typeorm';
import { ParkThisBaseEntity } from './ParkThisBaseEntity';
import { Level } from './Level';
import { VehicleType } from './VehicleType';
import { Vehicle } from './Vehicle';
import { getDbConnection } from '../utility/getDbConnection';
import { IVehicle } from '../vehicles/IVehicle';

@Entity("Garage")
export class Garage extends ParkThisBaseEntity {

    @Column({ type: "citext"})
    public name!: string;

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

    public async getAllVehiclesInGarage() {
        const db = await getDbConnection();
        const repo = db.getRepository(Garage);
        await repo.save(this);
    }

    public async canFit(vehicle: IVehicle) {
        // TODO make sure that garage can FIT this, meaning there's actually space
        // need to consider all vehicles that are parked in a apot, as well as those 
        // just "driving around" in garage but not parked yet.
        return true;
    }
}