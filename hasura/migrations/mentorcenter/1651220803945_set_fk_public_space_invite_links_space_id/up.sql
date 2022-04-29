alter table "public"."space_invite_links"
  add constraint "space_invite_links_space_id_fkey"
  foreign key ("space_id")
  references "public"."spaces"
  ("id") on update restrict on delete restrict;
