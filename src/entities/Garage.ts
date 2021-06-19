
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Level } from './Level';
import { VehicleType } from './VehicleType';

@Entity("Garage")
export class Garage extends BaseEntity {

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