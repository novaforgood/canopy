
alter table "public"."profile_to_chat_room" add column "latest_read_chat_message_id" uuid
 null;

alter table "public"."profile_to_chat_room" drop column "latest_read_chat_message_id" cascade;

alter table "public"."profile_to_chat_room" add column "latest_read_chat_message_id" bigint
 null;

alter table "public"."profile_to_chat_room"
  add constraint "profile_to_chat_room_latest_read_chat_message_id_fkey"
  foreign key ("latest_read_chat_message_id")
  references "public"."chat_message"
  ("id") on update restrict on delete restrict;
