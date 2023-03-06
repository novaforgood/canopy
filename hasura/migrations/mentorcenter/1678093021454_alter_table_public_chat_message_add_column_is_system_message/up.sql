alter table "public"."chat_message" add column "is_system_message" boolean
 not null default 'false';
