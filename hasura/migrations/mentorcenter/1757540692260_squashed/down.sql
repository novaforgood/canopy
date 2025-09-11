
alter table "public"."chat_message" drop constraint "chat_message_reply_to_message_id_fkey";

-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- alter table "public"."chat_message" add column "reply_to_message_id" int8
--  null;
