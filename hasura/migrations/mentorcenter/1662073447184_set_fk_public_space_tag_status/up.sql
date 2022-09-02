alter table "public"."space_tag"
  add constraint "space_tag_status_fkey"
  foreign key ("status")
  references "public"."space_tag_status"
  ("value") on update restrict on delete restrict;
