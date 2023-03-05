WITH ptcr_ids AS (
    SELECT chat_message.id, ptcr.id as ptcr_id FROM chat_message
    LEFT JOIN profile 
    ON profile.id = chat_message.sender_profile_id
    LEFT JOIN profile_to_chat_room AS ptcr 
    ON profile.id = ptcr.profile_id AND chat_message.chat_room_id = ptcr.chat_room_id
)
UPDATE chat_message
SET sender_ptcr_id = subquery.ptcr_id
FROM (
  SELECT id, ptcr_id FROM ptcr_ids
) AS subquery
WHERE chat_message.id = subquery.id;
