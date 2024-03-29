
-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- alter table "public"."user" add column "attributes" jsonb
--  not null default jsonb_build_object();

-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- CREATE OR REPLACE VIEW past_day_unread_messages_count AS (
--     SELECT chat_message.sender_profile_id as sender_profile_id, ptcr.profile_id as receiver_profile_id, COUNT(*) as unread_messages_count FROM chat_message
--     JOIN chat_room ON chat_message.chat_room_id = chat_room.id
--     JOIN profile_to_chat_room as ptcr ON ptcr.chat_room_id = chat_room.id
--     WHERE chat_message.created_at > (NOW() - INTERVAL '1 DAY')
--     AND chat_message.sender_profile_id != ptcr.profile_id
--     AND chat_message.id > COALESCE(ptcr.latest_read_chat_message_id, 0)
--     GROUP BY ptcr.profile_id, chat_message.sender_profile_id
-- );

-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- DROP VIEW past_day_unread_messages_count;

-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- CREATE OR REPLACE VIEW past_day_unread_messages_count AS (
--     SELECT profile.id as profile_id, COUNT(*) as unread_messages_count FROM chat_message
--     JOIN chat_room ON chat_message.chat_room_id = chat_room.id
--     JOIN profile_to_chat_room as ptcr ON ptcr.chat_room_id = chat_room.id
--     JOIN profile ON ptcr.profile_id = profile.id
--     WHERE chat_message.created_at > (NOW() - INTERVAL '1 DAY')
--     AND chat_message.sender_profile_id != ptcr.profile_id
--     AND chat_message.id > COALESCE(ptcr.latest_read_chat_message_id, 0)
--     GROUP BY profile.id
-- );
