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
