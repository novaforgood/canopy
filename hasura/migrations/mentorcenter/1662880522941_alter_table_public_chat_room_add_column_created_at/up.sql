alter table "public"."chat_room" add column "created_at" timestamptz
 null default now();
