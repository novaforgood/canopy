alter table "public"."chat_room"
  add constraint "chat_room_chat_intro_id_fkey"
  foreign key ("chat_intro_id")
  references "public"."chat_intro"
  ("id") on update restrict on delete restrict;
