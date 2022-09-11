alter table "public"."profile_to_chat_room" add column "created_at" timestamptz
 null default now();
