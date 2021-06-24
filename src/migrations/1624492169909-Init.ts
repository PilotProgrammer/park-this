import {MigrationInterface, QueryRunner} from "typeorm";

export class Init1624492169909 implements MigrationInterface {
    name = 'Init1624492169909'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."Spot_spottype_enum" AS ENUM('Motorcycle', 'CompactSpot', 'LargeSpot')`);
        await queryRunner.query(`CREATE TABLE "public"."Spot" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "dateAdded" TIMESTAMP NOT NULL DEFAULT now(), "spotNumber" integer NOT NULL, "occupyingVehicleId" uuid, "spotType" "public"."Spot_spottype_enum" NOT NULL, "parentRowId" uuid NOT NULL, CONSTRAINT "PK_278cc8fa694d803c93c00d2158c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."Vehicle_vehicletype_enum" AS ENUM('Motorcycle', 'Car', 'Bus')`);
        await queryRunner.query(`CREATE TABLE "public"."Vehicle" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "dateAdded" TIMESTAMP NOT NULL DEFAULT now(), "name" citext NOT NULL, "color" citext NOT NULL, "licensePlateNumber" citext NOT NULL, "state" citext NOT NULL, "vehicleType" "public"."Vehicle_vehicletype_enum" NOT NULL, "garageId" uuid, CONSTRAINT "PK_a0f7201376e93e661663bbcdaa4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "public"."Garage" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "dateAdded" TIMESTAMP NOT NULL DEFAULT now(), "name" citext NOT NULL, "company" citext NOT NULL, "streetAddress" citext NOT NULL, "city" citext NOT NULL, "state" citext NOT NULL, "postalCode" citext NOT NULL, CONSTRAINT "PK_ed5fbab5a4e5b8a5933c28d53cc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "public"."Level" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "dateAdded" TIMESTAMP NOT NULL DEFAULT now(), "levelNumber" integer NOT NULL, "garageId" uuid NOT NULL, CONSTRAINT "PK_3b841dd62955622d7bb99963fce" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "public"."ConsecutiveRow" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "dateAdded" TIMESTAMP NOT NULL DEFAULT now(), "rowNumber" integer NOT NULL, "levelId" uuid NOT NULL, CONSTRAINT "PK_52258c16a793d2f09237b41d22e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "public"."Spot" ADD CONSTRAINT "FK_a41b109b1944d8a5a936348e849" FOREIGN KEY ("parentRowId") REFERENCES "public"."ConsecutiveRow"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "public"."Spot" ADD CONSTRAINT "FK_3fef8845ac2cdeb605708499e1b" FOREIGN KEY ("occupyingVehicleId") REFERENCES "public"."Vehicle"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "public"."Vehicle" ADD CONSTRAINT "FK_3bde4277c81524dd49499d5aa42" FOREIGN KEY ("garageId") REFERENCES "public"."Garage"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "public"."Level" ADD CONSTRAINT "FK_b517830ef144ea0edb512519d08" FOREIGN KEY ("garageId") REFERENCES "public"."Garage"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "public"."ConsecutiveRow" ADD CONSTRAINT "FK_0b19dbf316108edcc74a5c4371b" FOREIGN KEY ("levelId") REFERENCES "public"."Level"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."ConsecutiveRow" DROP CONSTRAINT "FK_0b19dbf316108edcc74a5c4371b"`);
        await queryRunner.query(`ALTER TABLE "public"."Level" DROP CONSTRAINT "FK_b517830ef144ea0edb512519d08"`);
        await queryRunner.query(`ALTER TABLE "public"."Vehicle" DROP CONSTRAINT "FK_3bde4277c81524dd49499d5aa42"`);
        await queryRunner.query(`ALTER TABLE "public"."Spot" DROP CONSTRAINT "FK_3fef8845ac2cdeb605708499e1b"`);
        await queryRunner.query(`ALTER TABLE "public"."Spot" DROP CONSTRAINT "FK_a41b109b1944d8a5a936348e849"`);
        await queryRunner.query(`DROP TABLE "public"."ConsecutiveRow"`);
        await queryRunner.query(`DROP TABLE "public"."Level"`);
        await queryRunner.query(`DROP TABLE "public"."Garage"`);
        await queryRunner.query(`DROP TABLE "public"."Vehicle"`);
        await queryRunner.query(`DROP TYPE "public"."Vehicle_vehicletype_enum"`);
        await queryRunner.query(`DROP TABLE "public"."Spot"`);
        await queryRunner.query(`DROP TYPE "public"."Spot_spottype_enum"`);
    }

}
