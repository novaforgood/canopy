
alter table "public"."profile_types" rename to "profile_roles";

CREATE TABLE "public"."profiles_profile_roles" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "profile_id" uuid NOT NULL, "profile_role" text NOT NULL, PRIMARY KEY ("id") , FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON UPDATE restrict ON DELETE restrict, FOREIGN KEY ("profile_role") REFERENCES "public"."profile_roles"("value") ON UPDATE restrict ON DELETE restrict, UNIQUE ("profile_id", "profile_role"));
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DELETE from space_invite_links;
DELETE from profiles;
DELETE from spaces;

alter table "public"."profiles" drop constraint "profiles_type_fkey";

alter table "public"."profiles" drop column "type" cascade;

INSERT into profile_roles (value, description) VALUES
('MemberWhoCanList', 'Members who can list profiles');
