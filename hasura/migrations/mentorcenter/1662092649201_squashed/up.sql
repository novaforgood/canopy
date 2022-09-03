
alter table "public"."space_tag_category" add column "rigid_select" boolean
 not null default 'true';

CREATE TABLE "public"."space_tag_status" ("value" text NOT NULL, "description" text NOT NULL, PRIMARY KEY ("value") , UNIQUE ("value"));

INSERT into space_tag_status (value, description) VALUES
('Pending', 'Pending Admin review.'),
('Accepted', 'Shows in filter dropdown on home page'),
('Rejected', 'Does not show in filter dropdown on home page');

alter table "public"."space_tag" add column "status" text
 not null default 'Accepted';

alter table "public"."space_tag"
  add constraint "space_tag_status_fkey"
  foreign key ("status")
  references "public"."space_tag_status"
  ("value") on update restrict on delete restrict;

DELETE FROM space_tag_status WHERE value='Rejected';

INSERT into space_tag_status (value, description) VALUES
('Deleted', 'Marked by admin as not an official tag.');

UPDATE space_tag
SET status='Deleted'
WHERE deleted=true;
