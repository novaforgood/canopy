
CREATE TABLE "public"."space_tag_category" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "title" text NOT NULL, "space_id" uuid NOT NULL, PRIMARY KEY ("id") , FOREIGN KEY ("space_id") REFERENCES "public"."space"("id") ON UPDATE restrict ON DELETE restrict);
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE "public"."space_tag" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "space_tag_category_id" uuid NOT NULL, "label" text NOT NULL, PRIMARY KEY ("id") , FOREIGN KEY ("id") REFERENCES "public"."space_tag_category"("id") ON UPDATE restrict ON DELETE restrict);
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE "public"."profile_to_space_tag" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "profile_id" uuid NOT NULL, "space_tag_id" uuid NOT NULL, PRIMARY KEY ("id") , FOREIGN KEY ("id") REFERENCES "public"."profile"("id") ON UPDATE restrict ON DELETE restrict);
CREATE EXTENSION IF NOT EXISTS pgcrypto;

alter table "public"."space_tag" drop constraint "space_tag_id_fkey",
  add constraint "space_tag_space_tag_category_id_fkey"
  foreign key ("space_tag_category_id")
  references "public"."space_tag_category"
  ("id") on update restrict on delete restrict;

alter table "public"."profile_to_space_tag" drop constraint "profile_to_space_tag_id_fkey",
  add constraint "profile_to_space_tag_profile_id_fkey"
  foreign key ("profile_id")
  references "public"."profile"
  ("id") on update restrict on delete restrict;

alter table "public"."profile_to_space_tag"
  add constraint "profile_to_space_tag_space_tag_id_fkey"
  foreign key ("space_tag_id")
  references "public"."space_tag"
  ("id") on update restrict on delete restrict;
