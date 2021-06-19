
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';

@Entity("Vehicle")
export class Vehicle extends BaseEntity {

    @Column({ type: "citext"})
    name?: string;

    @Column({ type: "citext"})
    color?: string;

    @Column({ type: "citext"})
    licensePlateNumber!: string;
}