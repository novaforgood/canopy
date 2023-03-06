
alter table "public"."chat_message" add column "is_system_message" boolean
 not null default 'false';

alter table "public"."chat_message" add column "metadata" jsonb
 null;

alter table "public"."chat_message" alter column "sender_profile_id" drop not null;
