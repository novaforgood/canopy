alter table "public"."profile_to_space_tag"
  add constraint "profile_to_space_tag_space_tag_id_fkey"
  foreign key ("space_tag_id")
  references "public"."space_tag"
  ("id") on update restrict on delete restrict;
