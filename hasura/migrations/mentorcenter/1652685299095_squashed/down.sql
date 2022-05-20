
-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- DROP table "public"."space_attribute_type";

-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- DROP table "public"."space_attribute";

alter table "public"."space_listing_question" drop constraint "space_listing_question_space_id_listing_order_key";

-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- alter table "public"."space_listing_question" add column "listing_order" integer
--  not null;

alter table "public"."space_attribute" drop constraint "space_attribute_space_id_fkey";

DROP TABLE "public"."space_attribute";

-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- INSERT INTO "public"."space_attribute_type" (value, description) VALUES
-- ('ListingQuestionsOrder', 'Order of questions in space listings');

alter table "public"."space_attribute_type" rename to "space_listing_attribute_type";

comment on table "public"."space_listing_attribute_type" is NULL;

comment on table "public"."space_listing_attribute_type" is NULL;

DROP TABLE "public"."space_listing_attribute_type";

DROP TABLE "public"."profile_listing_response";

DROP TABLE "public"."space_listing_question";

alter table "public"."image" alter column "alt" drop not null;
alter table "public"."image" add column "alt" text;

alter table "public"."image" alter column "alt" set not null;

DROP TABLE "public"."profile_listing_image";

DROP TABLE "public"."image";

DROP TABLE "public"."profile_listing_social";

-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- INSERT INTO profile_listing_social_type (value, description) VALUES
-- ('LinkedIn', 'linkedin.com');

DROP TABLE "public"."profile_listing_social_type";

DROP TABLE "public"."profile_listing";

alter table "public"."profile" alter column "listing_enabled" drop not null;
alter table "public"."profile" add column "listing_enabled" bool;
