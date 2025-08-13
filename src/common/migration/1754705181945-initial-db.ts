import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1754705181945 implements MigrationInterface {
  name = 'Initial-DB-1754705181945';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "marketdata" ("id" SERIAL NOT NULL, "instrumentId" integer NOT NULL, "high" numeric(18,4), "low" numeric(18,4), "open" numeric(18,4), "close" numeric(18,4), "previousClose" numeric(18,4), "datetime" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_628325a2d6a47dfcfacc19fb054" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_05b768d303f4175b5965b991ac" ON "marketdata" ("instrumentId", "datetime") `
    );
    await queryRunner.query(
      `CREATE TABLE "instruments" ("id" SERIAL NOT NULL, "ticker" character varying(10) NOT NULL, "name" character varying(255) NOT NULL, "type" character varying(10) NOT NULL, CONSTRAINT "PK_44d772c3199b38559c5fb666eb6" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(`CREATE INDEX "IDX_f4a3991257da3fa5c258327aa0" ON "instruments" ("ticker") `);
    await queryRunner.query(`CREATE INDEX "IDX_2cfd43cad7a330c7cb45133ea1" ON "instruments" ("name") `);
    await queryRunner.query(
      `CREATE TABLE "orders" ("id" SERIAL NOT NULL, "instrumentId" integer NOT NULL, "userId" integer NOT NULL, "side" character varying NOT NULL, "size" integer NOT NULL, "price" numeric(18,4) NOT NULL, "type" character varying NOT NULL, "status" character varying NOT NULL, "datetime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "reason" text, "correlation_id" character varying, CONSTRAINT "PK_710e2d4957aa5878dfe94e4ac2f" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(`CREATE INDEX "IDX_e3ccf045d7075a1fa4a053e1fc" ON "orders" ("correlation_id") `);
    await queryRunner.query(`CREATE INDEX "IDX_e35a6ec021d1d19c9998ef162b" ON "orders" ("datetime") `);
    await queryRunner.query(
      `CREATE INDEX "IDX_b66f4eb3b39951811d0055df37" ON "orders" ("userId", "instrumentId", "status") `
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" SERIAL NOT NULL, "email" character varying(255) NOT NULL, "accountNumber" character varying(20) NOT NULL, CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users" ("email") `);
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_7fa878708339fe1fb34707db45" ON "users" ("accountNumber") `);
    await queryRunner.query(
      `ALTER TABLE "marketdata" ADD CONSTRAINT "FK_51062f17de5aa25b838ca950197" FOREIGN KEY ("instrumentId") REFERENCES "instruments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD CONSTRAINT "FK_f4eda5f59199007d1001a99d341" FOREIGN KEY ("instrumentId") REFERENCES "instruments"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD CONSTRAINT "FK_151b79a83ba240b0cb31b2302d1" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_151b79a83ba240b0cb31b2302d1"`);
    await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_f4eda5f59199007d1001a99d341"`);
    await queryRunner.query(`ALTER TABLE "marketdata" DROP CONSTRAINT "FK_51062f17de5aa25b838ca950197"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_7fa878708339fe1fb34707db45"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_97672ac88f789774dd47f7c8be"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_b66f4eb3b39951811d0055df37"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_e35a6ec021d1d19c9998ef162b"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_e3ccf045d7075a1fa4a053e1fc"`);
    await queryRunner.query(`DROP TABLE "orders"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_2cfd43cad7a330c7cb45133ea1"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_f4a3991257da3fa5c258327aa0"`);
    await queryRunner.query(`DROP TABLE "instruments"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_05b768d303f4175b5965b991ac"`);
    await queryRunner.query(`DROP TABLE "marketdata"`);
  }
}
