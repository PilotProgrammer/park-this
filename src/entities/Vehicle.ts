
import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Spot } from './Spot';
import { VehicleType } from './VehicleType';

@Entity("Vehicle")
export class Vehicle extends BaseEntity {

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