
-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- UPDATE space_tag
-- SET status='Deleted'
-- WHERE deleted=true;

-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- DELETE FROM space_tag_status WHERE value='Rejected';
--
-- INSERT into space_tag_status (value, description) VALUES
-- ('Deleted', 'Marked by admin as not an official tag.');

alter table "public"."space_tag" drop constraint "space_tag_status_fkey";

-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- alter table "public"."space_tag" add column "status" text
--  not null default 'Accepted';

-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- INSERT into space_tag_status (value, description) VALUES
-- ('Pending', 'Pending Admin review.'),
-- ('Accepted', 'Shows in filter dropdown on home page'),
-- ('Rejected', 'Does not show in filter dropdown on home page');

DROP TABLE "public"."space_tag_status";

-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- alter table "public"."space_tag_category" add column "rigid_select" boolean
--  not null default 'true';
