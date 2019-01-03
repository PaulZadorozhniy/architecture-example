import { QueryRunner } from 'typeorm';

export class InitCurriculumTables1531919423608 {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `CREATE TABLE "account" ("handle" uuid NOT NULL, "firstName" text NOT NULL, "lastName" text NOT NULL, "email" text NOT NULL, "cachedDate" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "accountClosed" boolean NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_734bbcf136a53616581ed7489c1" PRIMARY KEY ("handle"))`
    );
    await queryRunner.query(
      `CREATE TABLE "public"."activity_log" ("id" uuid NOT NULL, "user_handle" text NOT NULL, "description" text NOT NULL, "reference_id" text, "details" jsonb, "occurred_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "PK_3d3256b9fca2492fdb8a872be54" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "public"."role" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" text NOT NULL, "base_role" uuid, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_ab841b6a976216a286c10c117f1" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "public"."role_skill" ("role_id" uuid NOT NULL, "skill_id" uuid NOT NULL, "is_optional" boolean NOT NULL DEFAULT 'false', "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "REL_c42579b51bf304b96bad1b2587" UNIQUE ("role_id", "skill_id"), CONSTRAINT "PK_aa688554343528b4e4d83e4787f" PRIMARY KEY ("role_id", "skill_id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "public"."skill" ("id" uuid NOT NULL, "name" text NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_360e4142eb3e858a65771cc9b96" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `ALTER TABLE "public"."role" ADD CONSTRAINT "FK_a44f2d5ad50b421165c750560b9" FOREIGN KEY ("base_role") REFERENCES "public"."role"("id")`
    );
    await queryRunner.query(
      `ALTER TABLE "public"."role_skill" ADD CONSTRAINT "FK_c42579b51bf304b96bad1b25874" FOREIGN KEY ("role_id") REFERENCES "public"."role"("id")`
    );
    await queryRunner.query(
      `ALTER TABLE "public"."role_skill" ADD CONSTRAINT "FK_39ac4326070d58fac619892539e" FOREIGN KEY ("skill_id") REFERENCES "public"."skill"("id")`
    );
  }
}
