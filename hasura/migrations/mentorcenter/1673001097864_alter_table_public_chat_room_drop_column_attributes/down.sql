alter table "public"."chat_room" alter column "attributes" set default jsonb_build_object();
alter table "public"."chat_room" alter column "attributes" drop not null;
alter table "public"."chat_room" add column "attributes" jsonb;
