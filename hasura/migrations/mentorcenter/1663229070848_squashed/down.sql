
alter table "public"."chat_message" drop constraint "check_message_length";

-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- alter table "public"."chat_room" add column "deleted" boolean
--  not null default 'false';

DROP TABLE "public"."chat_message";

-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- DROP table "public"."chat_message";

-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- alter table "public"."profile_to_chat_room" add column "created_at" timestamptz
--  null default now();

-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- alter table "public"."chat_room" add column "created_at" timestamptz
--  null default now();

DROP TABLE "public"."chat_message";

DROP TABLE "public"."profile_to_chat_room";

DROP TABLE "public"."chat_room";
