import { Column, PrimaryGeneratedColumn } from 'typeorm'

export abstract class ParkThisBaseEntity {
  @PrimaryGeneratedColumn("uuid")
  public id!: string

  @Column({
    default: () => "CURRENT_TIMESTAMP"
  })
  dateAdded!: Date
}