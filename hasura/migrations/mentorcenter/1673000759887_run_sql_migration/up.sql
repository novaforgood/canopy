UPDATE chat_room
  SET chat_intro_id = (attributes ->> 'chatIntroId')::uuid;
