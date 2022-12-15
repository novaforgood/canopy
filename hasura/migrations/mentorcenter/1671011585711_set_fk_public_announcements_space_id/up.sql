alter table "public"."announcements"
  add constraint "announcements_space_id_fkey"
  foreign key ("space_id")
  references "public"."space"
  ("id") on update restrict on delete restrict;
