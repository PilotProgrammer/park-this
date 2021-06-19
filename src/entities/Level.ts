
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { ConsecutiveRow } from './ConsecutiveRow';
import { Garage } from './Garage';
import { VehicleType } from './VehicleType';

@Entity("Level")
export class Level extends BaseEntity {

    @Column({ type: "citext"})
    public index!: string;

    @ManyToOne(type => Garage, garage => garage.levels, { onDelete: "CASCADE", nullable: false})
    public garage!: Garage;

    @OneToMany(type => ConsecutiveRow, row => row.level, { cascade: true })
    public rows!: ConsecutiveRow[];

}