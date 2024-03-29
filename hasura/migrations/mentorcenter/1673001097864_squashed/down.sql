
alter table "public"."chat_room" alter column "attributes" set default jsonb_build_object();
alter table "public"."chat_room" alter column "attributes" drop not null;
alter table "public"."chat_room" add column "attributes" jsonb;

-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- CREATE OR REPLACE VIEW "public"."chat_intro_data" AS
--  WITH chat_intro_rooms AS (
--          SELECT chat_room.id AS chat_room_id,
--             (chat_room.chat_intro_id) AS chat_intro_id,
--             count(*) AS num_messages
--            FROM (chat_room
--              JOIN chat_message ON ((chat_message.chat_room_id = chat_room.id)))
--           WHERE ((chat_room.chat_intro_id) IS NOT NULL)
--           GROUP BY chat_room.id
--         ), rooms_with_replies AS (
--          SELECT chat_intro_rooms.chat_room_id,
--             chat_intro_rooms.chat_intro_id,
--             chat_intro_rooms.num_messages
--            FROM chat_intro_rooms
--           WHERE (chat_intro_rooms.num_messages > 1)
--         )
--  SELECT rooms_with_replies.chat_intro_id AS chat_intro_id,
--     count(*) AS num_rooms_with_replies
--    FROM rooms_with_replies
--   GROUP BY rooms_with_replies.chat_intro_id;

-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- UPDATE chat_room
--   SET chat_intro_id = (attributes ->> 'chatIntroId')::uuid;

alter table "public"."chat_room" drop constraint "chat_room_chat_intro_id_fkey";

-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- alter table "public"."chat_room" add column "chat_intro_id" uuid
--  null;
