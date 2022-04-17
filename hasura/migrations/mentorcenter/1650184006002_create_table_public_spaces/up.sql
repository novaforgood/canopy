CREATE TABLE "public"."spaces" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" timestamptz NOT NULL DEFAULT now(), "name" text NOT NULL, "slug" text NOT NULL, PRIMARY KEY ("id") , UNIQUE ("slug"));
CREATE EXTENSION IF NOT EXISTS pgcrypto;
