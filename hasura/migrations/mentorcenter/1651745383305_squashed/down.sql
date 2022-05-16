
-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- CREATE OR REPLACE VIEW "public"."profile_to_profile_role_flattened" AS
--  WITH RECURSIVE sub_tree AS (
--          SELECT profile_to_profile_role.id,
--             profile_to_profile_role.profile_id,
--             profile_to_profile_role.profile_role
--            FROM profile_to_profile_role
--         UNION ALL
--          SELECT st.id,
--             st.profile_id,
--             h.role AS profile_role
--            FROM profile_role_hierarchy h,
--             sub_tree st
--           WHERE (h.parent_role = st.profile_role)
--         )
--  SELECT sub_tree.id,
--     sub_tree.profile_id,
--     sub_tree.profile_role,
--     profile.user_id,
--     profile.space_id
--    FROM sub_tree
--    INNER JOIN profile
--    ON sub_tree.profile_id = profile.id;

alter view "public"."profile_to_profile_role_flattened" rename to "profile_role_flattened";

-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- CREATE OR REPLACE VIEW "public"."profile_role_flattened" AS
--  WITH RECURSIVE sub_tree AS (
--         SELECT id, profile_id, profile_role
--             FROM profile_to_profile_role
--         UNION ALL
--         SELECT st.id, st.profile_id, h.role AS profile_role
--             FROM profile_role_hierarchy h, sub_tree st
--             WHERE (h.parent_role = st.profile_role)
--     )
--  SELECT * FROM sub_tree;

-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- INSERT INTO profile_role_hierarchy (role, parent_role) VALUES
-- ('Member', 'MemberWhoCanList'),
-- ('MemberWhoCanList', 'Admin');

DROP TABLE "public"."profile_role_hierarchy";
