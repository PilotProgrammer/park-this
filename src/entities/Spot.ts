
import { Column, Entity, ManyToOne } from 'typeorm';

import { ParkThisBaseEntity } from './ParkThisBaseEntity';

import { ConsecutiveRow } from './ConsecutiveRow';
import { Vehicle } from './Vehicle';
import { SpotType } from './SpotType';

@Entity("Spot")
export class Spot extends ParkThisBaseEntity {

    @Column()
    public spotNumber!: number;
  
    @ManyToOne(type => ConsecutiveRow, row => row.spots, { onDelete: "CASCADE", nullable: false})
    public parentRow!: ConsecutiveRow;

    @ManyToOne(type => Vehicle, vehicle => vehicle.spots, { cascade: true })
    public occupyingVehicle!: Vehicle;

    @Column("enum", { enum: SpotType })
    public spotType!: SpotType;
}