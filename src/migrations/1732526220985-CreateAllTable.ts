import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAllTable1732526220985 implements MigrationInterface {
    name = 'CreateAllTable1732526220985'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "username" character varying NOT NULL, "password" character varying NOT NULL, "roleName" character varying NOT NULL, "activeStatus" boolean NOT NULL DEFAULT true, "orgId" integer NOT NULL DEFAULT '1', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_by" integer, "updated_at" TIMESTAMP, CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "video" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "description" character varying NOT NULL, "originalFilename" character varying NOT NULL, "folderPath" character varying NOT NULL, CONSTRAINT "PK_1a2f3856250765d72e7e1636c8e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "encoding" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "resolution" character varying NOT NULL, "bitrate" character varying NOT NULL, "filePath" character varying NOT NULL, "videoId" uuid, CONSTRAINT "PK_381bc7c152d72ec8e67081a45cc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "encoding" ADD CONSTRAINT "FK_7681459566b74058a723e62d4fc" FOREIGN KEY ("videoId") REFERENCES "video"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "encoding" DROP CONSTRAINT "FK_7681459566b74058a723e62d4fc"`);
        await queryRunner.query(`DROP TABLE "encoding"`);
        await queryRunner.query(`DROP TABLE "video"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }

}
