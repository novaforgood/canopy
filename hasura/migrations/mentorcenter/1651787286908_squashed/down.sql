
alter table "public"."profile_role_hierarchy" drop constraint "profile_role_hierarchy_parent_role_fkey";

alter table "public"."profile_role_hierarchy" drop constraint "profile_role_hierarchy_role_fkey";

alter table "public"."profile" drop constraint "profile_user_id_space_id_key";
