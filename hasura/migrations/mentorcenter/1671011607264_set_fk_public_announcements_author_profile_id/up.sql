alter table "public"."announcements"
  add constraint "announcements_author_profile_id_fkey"
  foreign key ("author_profile_id")
  references "public"."profile"
  ("id") on update restrict on delete restrict;
