alter table "public"."profile_to_chat_room"
  add constraint "profile_to_chat_room_latest_read_chat_message_id_fkey"
  foreign key ("latest_read_chat_message_id")
  references "public"."chat_message"
  ("id") on update restrict on delete restrict;
