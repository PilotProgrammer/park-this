
import { Column, Entity, OneToMany } from 'typeorm';
import { ParkThisBaseEntity } from './ParkThisBaseEntity';
import { Spot } from './Spot';
import { VehicleType } from './VehicleType';

@Entity("Vehicle")
export class Vehicle extends ParkThisBaseEntity {

    @Column({ type: "citext"})
    public name?: string;

    @Column({ type: "citext"})
    public color?: string;

    @Column({ type: "citext"})
    public licensePlateNumber!: string;

    @Column("enum", { enum: VehicleType })
    public vehicleType!: VehicleType;

    @OneToMany(type => Spot, spot => spot.occupyingVehicle)
    public spots!: Spot[];
}