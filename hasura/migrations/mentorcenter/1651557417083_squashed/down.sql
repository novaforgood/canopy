
-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- INSERT into profile_roles (value, description) VALUES
-- ('MemberWhoCanList', 'Members who can list profiles');

alter table "public"."profiles" alter column "type" drop not null;
alter table "public"."profiles" add column "type" text;

alter table "public"."profiles"
  add constraint "profiles_type_fkey"
  foreign key ("type")
  references "public"."profile_roles"
  ("value") on update restrict on delete restrict;

-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- DELETE from space_invite_links;
-- DELETE from profiles;
-- DELETE from spaces;

DROP TABLE "public"."profiles_profile_roles";

alter table "public"."profile_roles" rename to "profile_types";
