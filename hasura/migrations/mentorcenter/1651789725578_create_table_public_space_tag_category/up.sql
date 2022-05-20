CREATE TABLE "public"."space_tag_category" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "title" text NOT NULL, "space_id" uuid NOT NULL, PRIMARY KEY ("id") , FOREIGN KEY ("space_id") REFERENCES "public"."space"("id") ON UPDATE restrict ON DELETE restrict);
CREATE EXTENSION IF NOT EXISTS pgcrypto;
