
-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- DROP table "public"."profile_to_space_tag";

ALTER TABLE "public"."profile_listing_to_space_tag" ALTER COLUMN "id" drop default;

alter table "public"."profile_listing_to_space_tag" add constraint "profile_listing_to_space_tag_id_key" unique ("id");

alter table "public"."profile_listing_to_space_tag" drop constraint "profile_listing_to_space_tag_id_key";

DROP TABLE "public"."profile_listing_to_space_tag";

alter table "public"."profile_to_space_tag" drop constraint "profile_to_space_tag_profile_id_fkey",
  add constraint "profile_to_space_tag_profile_id_fkey"
  foreign key ("profile_id")
  references "public"."profile"
  ("id") on update restrict on delete restrict;

-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- drop schema "profile_listing_to_space_tag" cascade;

drop schema "profile_listing_to_space_tag" cascade;
