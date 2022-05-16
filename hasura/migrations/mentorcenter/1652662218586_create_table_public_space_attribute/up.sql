CREATE TABLE "public"."space_attribute" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "space_id" uuid NOT NULL, "type" text NOT NULL, "value" jsonb NOT NULL, PRIMARY KEY ("id") , FOREIGN KEY ("type") REFERENCES "public"."space_attribute_type"("value") ON UPDATE restrict ON DELETE restrict, UNIQUE ("space_id", "type"));
CREATE EXTENSION IF NOT EXISTS pgcrypto;
