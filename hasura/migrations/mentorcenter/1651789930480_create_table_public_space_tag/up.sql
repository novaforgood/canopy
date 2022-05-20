CREATE TABLE "public"."space_tag" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "space_tag_category_id" uuid NOT NULL, "label" text NOT NULL, PRIMARY KEY ("id") , FOREIGN KEY ("id") REFERENCES "public"."space_tag_category"("id") ON UPDATE restrict ON DELETE restrict);
CREATE EXTENSION IF NOT EXISTS pgcrypto;
