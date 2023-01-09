
alter table "public"."announcements" rename to "announcement";

CREATE TABLE "public"."report" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "subject_profile_id" uuid NOT NULL, "body" text NOT NULL, "reporter_profile_id" UUID, PRIMARY KEY ("id") , FOREIGN KEY ("subject_profile_id") REFERENCES "public"."profile"("id") ON UPDATE restrict ON DELETE restrict, FOREIGN KEY ("reporter_profile_id") REFERENCES "public"."profile"("id") ON UPDATE restrict ON DELETE restrict);
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE "public"."report_to_image" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "report_id" uuid NOT NULL, "image_id" uuid NOT NULL, PRIMARY KEY ("id") , FOREIGN KEY ("report_id") REFERENCES "public"."report"("id") ON UPDATE restrict ON DELETE restrict, FOREIGN KEY ("image_id") REFERENCES "public"."image"("id") ON UPDATE restrict ON DELETE restrict);
CREATE EXTENSION IF NOT EXISTS pgcrypto;

alter table "public"."report" add column "created_at" timestamptz
 not null default now();
