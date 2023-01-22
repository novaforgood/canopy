alter table "public"."profile_listing_response" drop constraint "profile_listing_response_profile_listing_id_fkey",
  add constraint "profile_listing_response_profile_listing_id_fkey"
  foreign key ("profile_listing_id")
  references "public"."profile_listing"
  ("id") on update restrict on delete restrict;
