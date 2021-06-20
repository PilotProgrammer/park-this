
import { Column, Entity, OneToMany } from 'typeorm';
import { ParkThisBaseEntity } from './ParkThisBaseEntity';
import { Level } from './Level';
import { VehicleType } from './VehicleType';

@Entity("Garage")
export class Garage extends ParkThisBaseEntity {

    @Column({ type: "citext"})
    public name!: string;

    @OneToMany(type => Level, level => level.garage, { cascade: true })
    public levels!: Level[];

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
}