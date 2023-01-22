alter table "public"."space"
  add constraint "space_owner_id_fkey"
  foreign key ("owner_id")
  references "public"."user"
  ("id") on update restrict on delete restrict;
