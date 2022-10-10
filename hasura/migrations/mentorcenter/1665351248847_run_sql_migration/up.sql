CREATE VIEW chat_message_admin_view AS
  SELECT id, sender_profile_id, created_at
    FROM chat_message;
