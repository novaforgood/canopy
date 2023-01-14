
alter table "public"."announcement" add column "updated_at" timestamptz
 not null default now();

CREATE OR REPLACE FUNCTION "public"."set_current_timestamp_updated_at"()
RETURNS TRIGGER AS $$
DECLARE
  _new record;
BEGIN
  _new := NEW;
  _new."updated_at" = NOW();
  RETURN _new;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER "set_public_announcement_updated_at"
BEFORE UPDATE ON "public"."announcement"
FOR EACH ROW
EXECUTE PROCEDURE "public"."set_current_timestamp_updated_at"();
COMMENT ON TRIGGER "set_public_announcement_updated_at" ON "public"."announcement" 
IS 'trigger to set value of column "updated_at" to current timestamp on row update';

alter table "public"."chat_message" add column "updated_at" timestamptz
 null default now();

CREATE OR REPLACE FUNCTION "public"."set_current_timestamp_updated_at"()
RETURNS TRIGGER AS $$
DECLARE
  _new record;
BEGIN
  _new := NEW;
  _new."updated_at" = NOW();
  RETURN _new;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER "set_public_chat_message_updated_at"
BEFORE UPDATE ON "public"."chat_message"
FOR EACH ROW
EXECUTE PROCEDURE "public"."set_current_timestamp_updated_at"();
COMMENT ON TRIGGER "set_public_chat_message_updated_at" ON "public"."chat_message" 
IS 'trigger to set value of column "updated_at" to current timestamp on row update';

alter table "public"."chat_message" alter column "updated_at" set not null;
