alter table "public"."chat_message"
  add constraint "chat_message_sender_profile_id_fkey"
  foreign key (sender_profile_id)
  references "public"."profile"
  (id) on update restrict on delete restrict;
alter table "public"."chat_message" alter column "sender_profile_id" drop not null;
alter table "public"."chat_message" add column "sender_profile_id" uuid;
