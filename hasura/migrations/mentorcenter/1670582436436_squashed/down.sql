
-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- CREATE OR REPLACE VIEW "public"."chat_intro_data" AS
--  WITH chat_intro_rooms AS (
--          SELECT chat_room.id AS chat_room_id,
--             (chat_room.attributes ->> 'chatIntroId'::text) AS chat_intro_id,
--             count(*) AS num_messages
--            FROM (chat_room
--              JOIN chat_message ON ((chat_message.chat_room_id = chat_room.id)))
--           WHERE ((chat_room.attributes ->> 'chatIntroId'::text) IS NOT NULL)
--           GROUP BY chat_room.id
--         ), rooms_with_replies AS (
--          SELECT chat_intro_rooms.chat_room_id,
--             chat_intro_rooms.chat_intro_id,
--             chat_intro_rooms.num_messages
--            FROM chat_intro_rooms
--           WHERE (chat_intro_rooms.num_messages > 1)
--         )
--  SELECT rooms_with_replies.chat_intro_id::uuid,
--     count(*) AS num_rooms_with_replies
--    FROM rooms_with_replies
--   GROUP BY rooms_with_replies.chat_intro_id;

-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- DROP VIEW chat_intro_data;

-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- CREATE VIEW chat_intro_data AS (
--     WITH chat_intro_rooms AS (
--         SELECT chat_room.id as chat_room_id, attributes ->> 'chatIntroId' as chat_intro_id, COUNT(*) as num_messages FROM chat_room
--         JOIN chat_message ON chat_message.chat_room_id = chat_room.id
--         WHERE attributes ->> 'chatIntroId' IS NOT NULL
--         GROUP BY chat_room.id
--     ), rooms_with_replies AS (
--         SELECT * FROM chat_intro_rooms
--         WHERE num_messages > 1
--     )
--     SELECT chat_intro_id, COUNT(*) as num_rooms_with_replies FROM rooms_with_replies
--     GROUP BY chat_intro_id
-- );

-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- alter table "public"."chat_room" add column "attributes" jsonb
--  not null default jsonb_build_object();

DROP TABLE "public"."chat_intro";

-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- alter table "public"."profile" add column "attributes" jsonb
--  not null default jsonb_build_object();

-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- CREATE OR REPLACE VIEW "public"."past_day_unread_messages_count" AS
--  SELECT chat_message.sender_profile_id,
--     ptcr.profile_id AS receiver_profile_id,
--     count(*) AS unread_messages_count
--    FROM ((chat_message
--      JOIN chat_room ON ((chat_message.chat_room_id = chat_room.id)))
--      JOIN profile_to_chat_room ptcr ON ((ptcr.chat_room_id = chat_room.id))
--      JOIN profile sender_profile ON sender_profile.id = chat_message.sender_profile_id
--      JOIN "user" sender_user ON sender_user.id = sender_profile.user_id
--      )
--   WHERE ((chat_message.created_at > (now() - '1 day'::interval)) AND (chat_message.sender_profile_id <> ptcr.profile_id) AND (chat_message.id > COALESCE(ptcr.latest_read_chat_message_id, (0)::bigint)))
--   AND sender_user."type" = 'User'
--   GROUP BY ptcr.profile_id, chat_message.sender_profile_id;

-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- INSERT INTO "user" (id, first_name, last_name, email, "type") VALUES
-- ('bot-BAZe9r-canopybot', 'Canopy', 'Bot', 'team+canopybot@joincanopy.org', 'Bot');

alter table "public"."user" drop constraint "user_type_fkey";

-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- alter table "public"."user" add column "type" text
--  not null default 'User';

-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- INSERT INTO user_type (value, description) VALUES
-- ('User', 'Normal user'),
-- ('Bot', 'Bot user');

DROP TABLE "public"."user_type";
