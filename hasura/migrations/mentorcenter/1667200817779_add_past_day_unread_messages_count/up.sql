CREATE OR REPLACE VIEW past_day_unread_messages_count AS (
    SELECT profile.id as profile_id, COUNT(*) as unread_messages_count FROM chat_message
    JOIN chat_room ON chat_message.chat_room_id = chat_room.id
    JOIN profile_to_chat_room as ptcr ON ptcr.chat_room_id = chat_room.id
    JOIN profile ON ptcr.profile_id = profile.id
    WHERE chat_message.created_at > (NOW() - INTERVAL '1 DAY')
    AND chat_message.sender_profile_id != ptcr.profile_id
    AND chat_message.id > COALESCE(ptcr.latest_read_chat_message_id, 0)
    GROUP BY profile.id
);
