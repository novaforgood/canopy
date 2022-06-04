alter table "public"."profile_listing_to_space_tag" drop constraint "profile_listing_to_space_tag_space_tag_id_fkey",
  add constraint "profile_listing_to_space_tag_space_tag_id_fkey"
  foreign key ("space_tag_id")
  references "public"."space_tag"
  ("id") on update restrict on delete cascade;
