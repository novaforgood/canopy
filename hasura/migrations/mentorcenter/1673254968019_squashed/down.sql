
-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- alter table "public"."report" add column "created_at" timestamptz
--  not null default now();

DROP TABLE "public"."report_to_image";

DROP TABLE "public"."report";

alter table "public"."announcement" rename to "announcements";
