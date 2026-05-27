import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1779909247611 implements MigrationInterface {
    name = 'InitialSchema1779909247611'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('customer', 'driver', 'restaurant_owner')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "name" character varying NOT NULL, "role" "public"."users_role_enum" NOT NULL DEFAULT 'customer', "password" character varying NOT NULL, "phoneNumber" character varying, "isActive" boolean NOT NULL DEFAULT true, "address" character varying, "refreshToken" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."driver_vehicletype_enum" AS ENUM('bicycle', 'motorcycle', 'car')`);
        await queryRunner.query(`CREATE TABLE "driver" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "vehicleType" "public"."driver_vehicletype_enum" NOT NULL DEFAULT 'motorcycle', "LicencePlate" character varying, "isActive" boolean NOT NULL DEFAULT false, "rating" numeric(3,2) NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "REL_abf4fe92b1ed7d4ffa2d4e8045" UNIQUE ("userId"), CONSTRAINT "PK_61de71a8d217d585ecd5ee3d065" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "driver-location" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "driverId" uuid NOT NULL, "latitude" numeric(10,7) NOT NULL, "longitude" numeric(10,7) NOT NULL, "heading" numeric, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "REL_96e807cd4ac54e55e295d56774" UNIQUE ("driverId"), CONSTRAINT "PK_6aa828ca99224889f30e6493119" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "driver" ADD CONSTRAINT "FK_abf4fe92b1ed7d4ffa2d4e8045a" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "driver-location" ADD CONSTRAINT "FK_96e807cd4ac54e55e295d56774f" FOREIGN KEY ("driverId") REFERENCES "driver"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "driver-location" DROP CONSTRAINT "FK_96e807cd4ac54e55e295d56774f"`);
        await queryRunner.query(`ALTER TABLE "driver" DROP CONSTRAINT "FK_abf4fe92b1ed7d4ffa2d4e8045a"`);
        await queryRunner.query(`DROP TABLE "driver-location"`);
        await queryRunner.query(`DROP TABLE "driver"`);
        await queryRunner.query(`DROP TYPE "public"."driver_vehicletype_enum"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    }

}
