alter table "public"."profiles"
  add constraint "profiles_type_fkey"
  foreign key ("type")
  references "public"."profile_types"
  ("value") on update restrict on delete restrict;
