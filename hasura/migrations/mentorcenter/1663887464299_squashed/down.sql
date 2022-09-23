
alter table "public"."profile_to_chat_room" drop constraint "profile_to_chat_room_latest_read_chat_message_id_fkey";

-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- alter table "public"."profile_to_chat_room" add column "latest_read_chat_message_id" bigint
--  null;

alter table "public"."profile_to_chat_room" alter column "latest_read_chat_message_id" drop not null;
alter table "public"."profile_to_chat_room" add column "latest_read_chat_message_id" uuid;

-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- alter table "public"."profile_to_chat_room" add column "latest_read_chat_message_id" uuid
--  null;
