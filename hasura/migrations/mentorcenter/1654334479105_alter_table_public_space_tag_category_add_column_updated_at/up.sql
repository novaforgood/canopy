alter table "public"."space_tag_category" add column "updated_at" timestamptz
 not null default now();
