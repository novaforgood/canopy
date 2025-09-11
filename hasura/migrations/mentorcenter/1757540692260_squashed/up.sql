
alter table "public"."chat_message" add column "reply_to_message_id" int8
 null;

alter table "public"."chat_message"
  add constraint "chat_message_reply_to_message_id_fkey"
  foreign key ("reply_to_message_id")
  references "public"."chat_message"
  ("id") on update restrict on delete restrict;
