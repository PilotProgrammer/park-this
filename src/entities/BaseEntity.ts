import {
  PrimaryGeneratedColumn, Column
} from 'typeorm'

export abstract class BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  public id!: string

  @Column({
    default: () => "CURRENT_TIMESTAMP"
  })
  dateAdded!: Date
}