alter table "public"."space_tag" drop constraint "space_tag_space_tag_category_id_fkey",
  add constraint "space_tag_id_fkey"
  foreign key ("id")
  references "public"."space_tag_category"
  ("id") on update restrict on delete restrict;
