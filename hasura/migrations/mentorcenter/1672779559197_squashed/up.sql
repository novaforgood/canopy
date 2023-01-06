
ALTER TABLE "public"."announcements" ALTER COLUMN "id" TYPE int8;

alter table "public"."profile" add column "last_read_announcement_id" bigint
 null;
