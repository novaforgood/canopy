
create schema "profile_listing_to_space_tag";

drop schema "profile_listing_to_space_tag" cascade;

alter table "public"."profile_to_space_tag" drop constraint "profile_to_space_tag_profile_id_fkey",
  add constraint "profile_to_space_tag_profile_id_fkey"
  foreign key ("profile_id")
  references "public"."profile"
  ("id") on update restrict on delete restrict;

CREATE TABLE "public"."profile_listing_to_space_tag" ("id" uuid NOT NULL, "profile_listing_id" uuid NOT NULL, "space_tag_id" uuid NOT NULL, PRIMARY KEY ("id") , FOREIGN KEY ("profile_listing_id") REFERENCES "public"."profile_listing"("id") ON UPDATE restrict ON DELETE restrict, FOREIGN KEY ("space_tag_id") REFERENCES "public"."space_tag"("id") ON UPDATE restrict ON DELETE restrict, UNIQUE ("id"));

alter table "public"."profile_listing_to_space_tag" add constraint "profile_listing_to_space_tag_id_key" unique ("id");

alter table "public"."profile_listing_to_space_tag" drop constraint "profile_listing_to_space_tag_id_key";

alter table "public"."profile_listing_to_space_tag" alter column "id" set default gen_random_uuid();

DROP table "public"."profile_to_space_tag";
