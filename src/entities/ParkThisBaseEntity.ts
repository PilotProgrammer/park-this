import {
  PrimaryGeneratedColumn, Column, BaseEntity
} from 'typeorm'

export abstract class ParkThisBaseEntity { //extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  public id!: string

  @Column({
    default: () => "CURRENT_TIMESTAMP"
  })
  dateAdded!: Date
}