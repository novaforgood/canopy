
alter table "public"."space_invite_links" drop constraint "space_invite_links_space_id_fkey";

-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- DELETE FROM profile_types WHERE value='SuperAdmin';

alter table "public"."profiles" alter column "listing_enabled" set default 'false';

alter table "public"."profiles" alter column "type" set default 'Member'::text;

-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- DELETE from spaces;

-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- DELETE from profiles;

alter table "public"."profiles" drop constraint "profiles_type_fkey";

-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- alter table "public"."profiles" add column "listing_enabled" boolean
--  not null default 'false';

-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- alter table "public"."profiles" add column "type" text
--  not null default 'Member';

-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- INSERT INTO profile_types (value, description) VALUES
--   ('Banned', 'Profile is banned from space'),
--   ('Member', 'Normal members'),
--   ('Admin', 'Admins'),
--   ('SuperAdmin', 'Admins that can manage other admins');

DROP TABLE "public"."profile_types";

alter table "public"."space_invite_links" drop constraint "space_invite_links_type_fkey";

-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- alter table "public"."space_invite_links" add column "type" text
--  not null;

-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- INSERT INTO space_invite_link_types (value, description) VALUES
--   ('Member', 'Allow users to join as members'),
--   ('MemberListingEnabled', 'Allow users to join as members who can list profiles');

DROP TABLE "public"."space_invite_link_types";

DROP TABLE "public"."space_invite_links";
