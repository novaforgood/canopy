CREATE TABLE "public"."image" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "url" text NOT NULL, "alt" text NOT NULL, PRIMARY KEY ("id") );
CREATE EXTENSION IF NOT EXISTS pgcrypto;
