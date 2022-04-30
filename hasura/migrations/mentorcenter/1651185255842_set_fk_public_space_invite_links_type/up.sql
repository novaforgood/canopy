alter table "public"."space_invite_links"
  add constraint "space_invite_links_type_fkey"
  foreign key ("type")
  references "public"."space_invite_link_types"
  ("value") on update restrict on delete restrict;
