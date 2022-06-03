
-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- alter table "public"."profile_listing" add column "headline" text
--  null;

alter table "public"."space" rename column "description_html" to "description";

-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- alter table "public"."space" add column "description" text
--  null;

alter table "public"."space_cover_image" drop constraint "space_cover_image_space_id_key";

alter table "public"."space_cover_image" add constraint "space_cover_image_image_id_space_id_key" unique ("image_id", "space_id");

DROP TABLE "public"."space_cover_image";
