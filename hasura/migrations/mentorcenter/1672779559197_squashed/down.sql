
-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- alter table "public"."profile" add column "last_read_announcement_id" bigint
--  null;

ALTER TABLE "public"."announcements" ALTER COLUMN "id" TYPE integer;
