
CREATE TABLE "public"."space_invite_links" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "space_id" uuid NOT NULL, "created_at" timestamptz NOT NULL DEFAULT now(), "expires_at" timestamptz NOT NULL, PRIMARY KEY ("id") );
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE "public"."space_invite_link_types" ("value" text NOT NULL, "description" text, PRIMARY KEY ("value") );

INSERT INTO space_invite_link_types (value, description) VALUES
  ('Member', 'Allow users to join as members'),
  ('MemberListingEnabled', 'Allow users to join as members who can list profiles');

alter table "public"."space_invite_links" add column "type" text
 not null;

alter table "public"."space_invite_links"
  add constraint "space_invite_links_type_fkey"
  foreign key ("type")
  references "public"."space_invite_link_types"
  ("value") on update restrict on delete restrict;

CREATE TABLE "public"."profile_types" ("value" text NOT NULL, "description" text, PRIMARY KEY ("value") );

INSERT INTO profile_types (value, description) VALUES
  ('Banned', 'Profile is banned from space'),
  ('Member', 'Normal members'),
  ('Admin', 'Admins'),
  ('SuperAdmin', 'Admins that can manage other admins');

alter table "public"."profiles" add column "type" text
 not null default 'Member';

alter table "public"."profiles" add column "listing_enabled" boolean
 not null default 'false';

alter table "public"."profiles"
  add constraint "profiles_type_fkey"
  foreign key ("type")
  references "public"."profile_types"
  ("value") on update restrict on delete restrict;

DELETE from profiles;

DELETE from spaces;

ALTER TABLE "public"."profiles" ALTER COLUMN "type" drop default;

ALTER TABLE "public"."profiles" ALTER COLUMN "listing_enabled" drop default;

DELETE FROM profile_types WHERE value='SuperAdmin';

alter table "public"."space_invite_links"
  add constraint "space_invite_links_space_id_fkey"
  foreign key ("space_id")
  references "public"."spaces"
  ("id") on update restrict on delete restrict;
