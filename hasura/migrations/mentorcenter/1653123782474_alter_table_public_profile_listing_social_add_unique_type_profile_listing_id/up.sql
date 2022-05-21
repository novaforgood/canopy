alter table "public"."profile_listing_social" add constraint "profile_listing_social_type_profile_listing_id_key" unique ("type", "profile_listing_id");
