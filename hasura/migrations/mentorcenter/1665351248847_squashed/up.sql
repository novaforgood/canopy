
CREATE TABLE "public"."event_profile_view" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "viewed_profile_id" uuid NOT NULL, "viewer_profile_id" uuid NOT NULL, "created_at" timestamptz NOT NULL DEFAULT now(), PRIMARY KEY ("id") , FOREIGN KEY ("viewed_profile_id") REFERENCES "public"."profile"("id") ON UPDATE restrict ON DELETE restrict, FOREIGN KEY ("viewer_profile_id") REFERENCES "public"."profile"("id") ON UPDATE restrict ON DELETE restrict);
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION public.run_before_insert_event_profile_view()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
    BEGIN
        IF EXISTS (
            SELECT FROM event_profile_view 
            WHERE viewed_profile_id = NEW.viewed_profile_id
                AND viewer_profile_id = NEW.viewer_profile_id
                AND (now() - interval '15 minutes') < created_at
        ) THEN
            RAISE EXCEPTION USING ERRCODE = '22000', MESSAGE = 'Cannot insert duplicate event within 15 minutes';
        END IF;
        
        RETURN NEW;
    END;
$function$;

CREATE TRIGGER before_insert_event_profile_view_trigger
   BEFORE INSERT
   ON event_profile_view
   FOR EACH ROW
   EXECUTE PROCEDURE run_before_insert_event_profile_view();

CREATE VIEW chat_message_admin_view AS
  SELECT id, sender_profile_id, created_at
    FROM chat_message;
