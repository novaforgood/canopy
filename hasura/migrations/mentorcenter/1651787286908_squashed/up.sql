
alter table "public"."profile" add constraint "profile_user_id_space_id_key" unique ("user_id", "space_id");

alter table "public"."profile_role_hierarchy"
  add constraint "profile_role_hierarchy_role_fkey"
  foreign key ("role")
  references "public"."profile_role"
  ("value") on update restrict on delete restrict;

alter table "public"."profile_role_hierarchy"
  add constraint "profile_role_hierarchy_parent_role_fkey"
  foreign key ("parent_role")
  references "public"."profile_role"
  ("value") on update restrict on delete restrict;
