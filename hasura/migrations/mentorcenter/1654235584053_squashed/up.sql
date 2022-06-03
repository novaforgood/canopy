
CREATE TABLE "public"."space_cover_image" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "space_id" uuid NOT NULL, "image_id" uuid NOT NULL, PRIMARY KEY ("id") , FOREIGN KEY ("image_id") REFERENCES "public"."image"("id") ON UPDATE restrict ON DELETE restrict, FOREIGN KEY ("space_id") REFERENCES "public"."space"("id") ON UPDATE restrict ON DELETE restrict, UNIQUE ("space_id", "image_id"));
CREATE EXTENSION IF NOT EXISTS pgcrypto;

alter table "public"."space_cover_image" drop constraint "space_cover_image_space_id_image_id_key";

alter table "public"."space_cover_image" add constraint "space_cover_image_space_id_key" unique ("space_id");

alter table "public"."space" add column "description" text
 null;

alter table "public"."space" rename column "description" to "description_html";

alter table "public"."profile_listing" add column "headline" text
 null;
