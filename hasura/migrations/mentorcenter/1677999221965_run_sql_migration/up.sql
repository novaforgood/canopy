CREATE
OR REPLACE VIEW "public"."chat_message_admin_view" AS
SELECT
  chat_message.id,
  chat_message.sender_ptcr_id,
  chat_message.created_at
FROM
  chat_message;
