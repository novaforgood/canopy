
alter table "public"."chat_message" alter column "sender_profile_id" set not null;

-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- alter table "public"."chat_message" add column "metadata" jsonb
--  null;

-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- alter table "public"."chat_message" add column "is_system_message" boolean
--  not null default 'false';
