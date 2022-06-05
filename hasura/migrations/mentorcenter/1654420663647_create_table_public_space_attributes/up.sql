CREATE TABLE "public"."space_attributes" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "space_id" uuid NOT NULL, "privacy_settings" jsonb NOT NULL DEFAULT jsonb_build_object(), PRIMARY KEY ("id") , FOREIGN KEY ("space_id") REFERENCES "public"."space"("id") ON UPDATE restrict ON DELETE restrict);
CREATE EXTENSION IF NOT EXISTS pgcrypto;
