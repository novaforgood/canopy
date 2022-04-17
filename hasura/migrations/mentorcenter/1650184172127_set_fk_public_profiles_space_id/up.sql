alter table "public"."profiles"
  add constraint "profiles_space_id_fkey"
  foreign key ("space_id")
  references "public"."spaces"
  ("id") on update restrict on delete restrict;
