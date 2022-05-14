CREATE TABLE "public"."profile_listing" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "profile_id" uuid NOT NULL, "public" boolean NOT NULL, PRIMARY KEY ("id") , FOREIGN KEY ("profile_id") REFERENCES "public"."profile"("id") ON UPDATE restrict ON DELETE restrict);
CREATE EXTENSION IF NOT EXISTS pgcrypto;
