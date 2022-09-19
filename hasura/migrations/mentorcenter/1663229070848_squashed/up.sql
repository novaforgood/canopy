
CREATE TABLE "public"."chat_room" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), PRIMARY KEY ("id") );
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE "public"."profile_to_chat_room" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "profile_id" uuid NOT NULL, "chat_room_id" uuid NOT NULL, PRIMARY KEY ("id") , FOREIGN KEY ("profile_id") REFERENCES "public"."profile"("id") ON UPDATE restrict ON DELETE restrict, FOREIGN KEY ("chat_room_id") REFERENCES "public"."chat_room"("id") ON UPDATE restrict ON DELETE restrict, UNIQUE ("profile_id", "chat_room_id"));
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE "public"."chat_message" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "chat_room_id" uuid NOT NULL, "sender_profile_id" uuid NOT NULL, "text" text NOT NULL, "deleted" boolean NOT NULL DEFAULT false, "created_at" timestamptz NOT NULL DEFAULT now(), PRIMARY KEY ("id") , FOREIGN KEY ("chat_room_id") REFERENCES "public"."chat_room"("id") ON UPDATE restrict ON DELETE restrict, FOREIGN KEY ("sender_profile_id") REFERENCES "public"."profile"("id") ON UPDATE restrict ON DELETE restrict);
CREATE EXTENSION IF NOT EXISTS pgcrypto;

alter table "public"."chat_room" add column "created_at" timestamptz
 null default now();

alter table "public"."profile_to_chat_room" add column "created_at" timestamptz
 null default now();

DROP table "public"."chat_message";

CREATE TABLE "public"."chat_message" ("id" bigserial NOT NULL, "chat_room_id" uuid NOT NULL, "sender_profile_id" uuid NOT NULL, "text" text NOT NULL, "created_at" timestamptz NOT NULL DEFAULT now(), "deleted" boolean NOT NULL DEFAULT false, PRIMARY KEY ("id") , FOREIGN KEY ("chat_room_id") REFERENCES "public"."chat_room"("id") ON UPDATE restrict ON DELETE restrict, FOREIGN KEY ("sender_profile_id") REFERENCES "public"."profile"("id") ON UPDATE restrict ON DELETE restrict);

alter table "public"."chat_room" add column "deleted" boolean
 not null default 'false';

alter table "public"."chat_message" add constraint "check_message_length" check (length(text) >= 1);
