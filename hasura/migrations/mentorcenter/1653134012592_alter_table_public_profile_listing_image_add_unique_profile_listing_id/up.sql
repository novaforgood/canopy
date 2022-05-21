alter table "public"."profile_listing_image" drop constraint "profile_listing_image_profile_listing_id_image_id_key";
alter table "public"."profile_listing_image" add constraint "profile_listing_image_profile_listing_id_key" unique ("profile_listing_id");
