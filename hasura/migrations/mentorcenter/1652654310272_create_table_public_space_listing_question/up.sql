CREATE TABLE "public"."space_listing_question" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "space_id" uuid NOT NULL, "title" text NOT NULL, "char_count" integer NOT NULL, PRIMARY KEY ("id") , FOREIGN KEY ("space_id") REFERENCES "public"."space"("id") ON UPDATE restrict ON DELETE restrict);
CREATE EXTENSION IF NOT EXISTS pgcrypto;
