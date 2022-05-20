alter table "public"."profile_to_space_tag" drop constraint "profile_to_space_tag_profile_id_fkey",
  add constraint "profile_to_space_tag_id_fkey"
  foreign key ("id")
  references "public"."profile"
  ("id") on update restrict on delete restrict;
