alter table "public"."profile_listing_image" drop constraint "profile_listing_image_profile_listing_id_fkey",
  add constraint "profile_listing_image_profile_listing_id_fkey"
  foreign key ("profile_listing_id")
  references "public"."profile_listing"
  ("id") on update restrict on delete cascade;
