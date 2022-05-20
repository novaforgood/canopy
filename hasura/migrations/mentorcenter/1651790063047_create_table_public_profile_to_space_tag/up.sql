CREATE TABLE "public"."profile_to_space_tag" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "profile_id" uuid NOT NULL, "space_tag_id" uuid NOT NULL, PRIMARY KEY ("id") , FOREIGN KEY ("id") REFERENCES "public"."profile"("id") ON UPDATE restrict ON DELETE restrict);
CREATE EXTENSION IF NOT EXISTS pgcrypto;
