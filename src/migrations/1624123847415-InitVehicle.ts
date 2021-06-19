import {MigrationInterface, QueryRunner} from "typeorm";

export class InitVehicle1624123847415 implements MigrationInterface {
    name = 'InitVehicle1624123847415'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "public"."Vehicle" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "dateAdded" TIMESTAMP NOT NULL DEFAULT now(), "name" citext NOT NULL, "color" citext NOT NULL, "licensePlateNumber" citext NOT NULL, CONSTRAINT "PK_a0f7201376e93e661663bbcdaa4" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "public"."Vehicle"`);
    }

}
