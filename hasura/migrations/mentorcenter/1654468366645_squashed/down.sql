
alter view "public"."public_space" rename to "space_public";

-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- CREATE VIEW space_public AS
--   SELECT id, name, slug
--     FROM space;

alter table "public"."connection_request" alter column "status" drop not null;

alter table "public"."connection_request" alter column "updated_at" drop not null;

-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- alter table "public"."connection_request" add column "updated_at" timestamptz
--  null default now();

alter table "public"."connection_request" drop constraint "connection_request_status_fkey";

-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- alter table "public"."connection_request" add column "status" text
--  null default 'ConnectionRequestSent';

alter table "public"."connection_request" alter column "confirmed_at" drop not null;
alter table "public"."connection_request" add column "confirmed_at" timestamptz;

alter table "public"."connection_request" alter column "confirmed" set default false;
alter table "public"."connection_request" alter column "confirmed" drop not null;
alter table "public"."connection_request" add column "confirmed" bool;

-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- INSERT INTO connection_request_status (value, description) VALUES
-- ('ConnectionRequestSent', 'The connection request was sent (default status)'),
-- ('MetWith', 'The two people have met');

DROP TABLE "public"."connection_request_status";

-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- alter table "public"."space" add column "attributes" jsonb
--  not null default jsonb_build_object();

-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- DROP table "public"."space_attributes";

alter table "public"."space_attributes" drop constraint "space_attributes_space_id_key";

DROP TABLE "public"."space_attributes";

-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- alter table "public"."space_tag" add column "deleted" boolean
--  not null default 'false';

-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- alter table "public"."space_listing_question" add column "updated_at" timestamptz
--  not null default now();

-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- alter table "public"."space_tag_category" add column "updated_at" timestamptz
--  not null default now();

alter table "public"."profile_listing_to_space_tag" drop constraint "profile_listing_to_space_tag_profile_listing_id_fkey",
  add constraint "profile_listing_to_space_tag_profile_listing_id_fkey"
  foreign key ("profile_listing_id")
  references "public"."profile_listing"
  ("id") on update restrict on delete restrict;

alter table "public"."profile_listing_to_space_tag" drop constraint "profile_listing_to_space_tag_space_tag_id_fkey",
  add constraint "profile_listing_to_space_tag_space_tag_id_fkey"
  foreign key ("space_tag_id")
  references "public"."space_tag"
  ("id") on update restrict on delete restrict;

-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- alter table "public"."space_tag_category" add column "deleted" boolean
--  not null default 'false';

-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- alter table "public"."space_listing_question" add column "deleted" boolean
--  not null default 'false';

DROP TABLE "public"."connection_request";

-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- alter table "public"."user" add column "last_active_at" timestamptz
--  not null default now();

-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- alter table "public"."space_tag_category" add column "listing_order" integer
--  not null;

-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- DELETE FROM space_tag_category;

-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- DELETE FROM space_tag;

-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- DELETE FROM profile_listing_to_space_tag;
