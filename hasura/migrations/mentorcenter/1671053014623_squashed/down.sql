
alter table "public"."announcements" alter column "title" drop not null;
alter table "public"."announcements" add column "title" text;

-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- alter table "public"."announcements" add column "title" text
--  null;

alter table "public"."announcements" drop constraint "announcements_author_profile_id_fkey";

alter table "public"."announcements" drop constraint "announcements_space_id_fkey";

DROP TABLE "public"."announcements";

-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- alter table "public"."space_listing_question" add column "description" text
--  null;
