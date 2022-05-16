alter table "public"."space_attribute"
  add constraint "space_attribute_space_id_fkey"
  foreign key ("space_id")
  references "public"."space"
  ("id") on update restrict on delete restrict;
