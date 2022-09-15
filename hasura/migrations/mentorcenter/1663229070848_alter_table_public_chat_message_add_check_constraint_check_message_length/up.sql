alter table "public"."chat_message" add constraint "check_message_length" check (length(text) >= 1);
