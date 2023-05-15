
CREATE TABLE "public"."block" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "blocker_profile_id" uuid NOT NULL, "blocked_profile_id" uuid NOT NULL, PRIMARY KEY ("id") , FOREIGN KEY ("blocker_profile_id") REFERENCES "public"."profile"("id") ON UPDATE restrict ON DELETE restrict, FOREIGN KEY ("blocked_profile_id") REFERENCES "public"."profile"("id") ON UPDATE restrict ON DELETE restrict, UNIQUE ("blocker_profile_id", "blocked_profile_id"));COMMENT ON TABLE "public"."block" IS E'Each row represents a profile blocking another profile';
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION public.profile_blocked_by_user(profile_row profile, hasura_session json)
 RETURNS boolean
 LANGUAGE sql
 STABLE
AS $function$
SELECT EXISTS (
    SELECT 1
    FROM block
    JOIN profile ON block.blocker_profile_id = profile.id
    WHERE block.blocker_profile_id = profile.id 
        AND profile.user_id = hasura_session ->> 'x-hasura-user-id'
);
$function$;
