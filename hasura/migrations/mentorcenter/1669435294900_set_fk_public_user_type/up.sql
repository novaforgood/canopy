alter table "public"."user"
  add constraint "user_type_fkey"
  foreign key ("type")
  references "public"."user_type"
  ("value") on update restrict on delete restrict;
