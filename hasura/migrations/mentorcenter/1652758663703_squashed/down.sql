
ALTER TABLE "public"."profile_listing" ALTER COLUMN "public" drop default;

alter table "public"."profile_listing_response" drop constraint "profile_listing_response_space_listing_question_id_profile_listing_id_key";

alter table "public"."profile_listing" drop constraint "profile_listing_profile_id_key";
