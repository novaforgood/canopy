
alter table "public"."profile_to_space_tag" drop constraint "profile_to_space_tag_space_tag_id_fkey";

alter table "public"."profile_to_space_tag" drop constraint "profile_to_space_tag_profile_id_fkey",
  add constraint "profile_to_space_tag_id_fkey"
  foreign key ("id")
  references "public"."profile"
  ("id") on update restrict on delete restrict;

alter table "public"."space_tag" drop constraint "space_tag_space_tag_category_id_fkey",
  add constraint "space_tag_id_fkey"
  foreign key ("id")
  references "public"."space_tag_category"
  ("id") on update restrict on delete restrict;

DROP TABLE "public"."profile_to_space_tag";

DROP TABLE "public"."space_tag";

DROP TABLE "public"."space_tag_category";
