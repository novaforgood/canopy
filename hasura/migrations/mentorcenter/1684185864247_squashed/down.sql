
-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- CREATE OR REPLACE FUNCTION public.profile_blocked_by_user(profile_row profile, hasura_session json)
--  RETURNS boolean
--  LANGUAGE sql
--  STABLE
-- AS $function$
-- SELECT EXISTS (
--     SELECT 1
--     FROM block
--     JOIN profile ON block.blocker_profile_id = profile.id
--     WHERE block.blocker_profile_id = profile.id
--         AND profile.user_id = hasura_session ->> 'x-hasura-user-id'
-- );
-- $function$;

-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- CREATE OR REPLACE FUNCTION profile_blocked_by_user(profile_row profile, hasura_session json)
-- RETURNS boolean AS $$
-- SELECT EXISTS (
--     SELECT 1
--     FROM block
--     JOIN profile ON block.blocker_profile_id = profile.id
--     WHERE block.blocker_profile_id = profile_row.id
--         AND profile.user_id = hasura_session ->> 'x-hasura-user-id'
-- );
-- $$ LANGUAGE sql STABLE;

DROP TABLE "public"."block";