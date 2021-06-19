
import { Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { ConsecutiveRow } from './ConsecutiveRow';
import { Vehicle } from './Vehicle';

@Entity("Spot")
export class Spot extends BaseEntity {

    @ManyToOne(type => ConsecutiveRow, row => row.spots, { onDelete: "CASCADE", nullable: false})
    public parentRow!: ConsecutiveRow;

    @ManyToOne(type => Vehicle, vehicle => vehicle.spots, { cascade: true })
    public occupyingVehicle!: Vehicle;
}