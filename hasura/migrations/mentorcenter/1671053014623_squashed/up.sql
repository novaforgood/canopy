
alter table "public"."space_listing_question" add column "description" text
 null;

CREATE TABLE "public"."announcements" ("id" serial NOT NULL, "space_id" uuid NOT NULL, "author_profile_id" uuid NOT NULL, "created_at" timestamptz NOT NULL DEFAULT now(), "deleted" boolean NOT NULL DEFAULT false, "content" text NOT NULL, PRIMARY KEY ("id") );

alter table "public"."announcements"
  add constraint "announcements_space_id_fkey"
  foreign key ("space_id")
  references "public"."space"
  ("id") on update restrict on delete restrict;

alter table "public"."announcements"
  add constraint "announcements_author_profile_id_fkey"
  foreign key ("author_profile_id")
  references "public"."profile"
  ("id") on update restrict on delete restrict;

alter table "public"."announcements" add column "title" text
 null;

alter table "public"."announcements" drop column "title" cascade;
