
alter table "public"."profile_listing_image" drop constraint "profile_listing_image_profile_listing_id_key";
alter table "public"."profile_listing_image" add constraint "profile_listing_image_image_id_profile_listing_id_key" unique ("image_id", "profile_listing_id");

alter table "public"."profile_listing_image" drop constraint "profile_listing_image_profile_listing_id_image_id_key";

alter table "public"."image" drop constraint "image_uploader_user_id_fkey";

-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- alter table "public"."image" add column "uploader_user_id" text
--  not null;

-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- DELETE FROM image;

alter table "public"."profile_listing_social" drop constraint "profile_listing_social_type_profile_listing_id_key";

-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- INSERT INTO profile_listing_social_type VALUES
-- ('Instagram', 'instagram.com'),
-- ('Twitter', 'twitter.com');
