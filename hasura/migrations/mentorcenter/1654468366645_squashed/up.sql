
DELETE FROM profile_listing_to_space_tag;

DELETE FROM space_tag;

DELETE FROM space_tag_category;

alter table "public"."space_tag_category" add column "listing_order" integer
 not null;

alter table "public"."user" add column "last_active_at" timestamptz
 not null default now();

CREATE TABLE "public"."connection_request" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" timestamptz NOT NULL DEFAULT now(), "confirmed_at" timestamptz, "sender_profile_id" uuid NOT NULL, "receiver_profile_id" uuid NOT NULL, "confirmed" boolean NOT NULL DEFAULT false, PRIMARY KEY ("id") , FOREIGN KEY ("sender_profile_id") REFERENCES "public"."profile"("id") ON UPDATE restrict ON DELETE restrict, FOREIGN KEY ("receiver_profile_id") REFERENCES "public"."profile"("id") ON UPDATE restrict ON DELETE restrict);
CREATE EXTENSION IF NOT EXISTS pgcrypto;

alter table "public"."space_listing_question" add column "deleted" boolean
 not null default 'false';

alter table "public"."space_tag_category" add column "deleted" boolean
 not null default 'false';

alter table "public"."profile_listing_to_space_tag" drop constraint "profile_listing_to_space_tag_space_tag_id_fkey",
  add constraint "profile_listing_to_space_tag_space_tag_id_fkey"
  foreign key ("space_tag_id")
  references "public"."space_tag"
  ("id") on update restrict on delete cascade;

alter table "public"."profile_listing_to_space_tag" drop constraint "profile_listing_to_space_tag_profile_listing_id_fkey",
  add constraint "profile_listing_to_space_tag_profile_listing_id_fkey"
  foreign key ("profile_listing_id")
  references "public"."profile_listing"
  ("id") on update restrict on delete cascade;

alter table "public"."space_tag_category" add column "updated_at" timestamptz
 not null default now();

alter table "public"."space_listing_question" add column "updated_at" timestamptz
 not null default now();

alter table "public"."space_tag" add column "deleted" boolean
 not null default 'false';

CREATE TABLE "public"."space_attributes" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "space_id" uuid NOT NULL, "privacy_settings" jsonb NOT NULL DEFAULT jsonb_build_object(), PRIMARY KEY ("id") , FOREIGN KEY ("space_id") REFERENCES "public"."space"("id") ON UPDATE restrict ON DELETE restrict);
CREATE EXTENSION IF NOT EXISTS pgcrypto;

alter table "public"."space_attributes" add constraint "space_attributes_space_id_key" unique ("space_id");

DROP table "public"."space_attributes";

alter table "public"."space" add column "attributes" jsonb
 not null default jsonb_build_object();

CREATE TABLE "public"."connection_request_status" ("value" text NOT NULL, "description" text NOT NULL, PRIMARY KEY ("value") );

INSERT INTO connection_request_status (value, description) VALUES
('ConnectionRequestSent', 'The connection request was sent (default status)'),
('MetWith', 'The two people have met');

alter table "public"."connection_request" drop column "confirmed" cascade;

alter table "public"."connection_request" drop column "confirmed_at" cascade;

alter table "public"."connection_request" add column "status" text
 null default 'ConnectionRequestSent';

alter table "public"."connection_request"
  add constraint "connection_request_status_fkey"
  foreign key ("status")
  references "public"."connection_request_status"
  ("value") on update restrict on delete restrict;

alter table "public"."connection_request" add column "updated_at" timestamptz
 null default now();

alter table "public"."connection_request" alter column "updated_at" set not null;

alter table "public"."connection_request" alter column "status" set not null;

CREATE VIEW space_public AS
  SELECT id, name, slug
    FROM space;

alter view "public"."space_public" rename to "public_space";
