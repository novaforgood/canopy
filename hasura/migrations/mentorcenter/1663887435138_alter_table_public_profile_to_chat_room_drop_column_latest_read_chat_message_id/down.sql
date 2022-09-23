alter table "public"."profile_to_chat_room" alter column "latest_read_chat_message_id" drop not null;
alter table "public"."profile_to_chat_room" add column "latest_read_chat_message_id" uuid;
