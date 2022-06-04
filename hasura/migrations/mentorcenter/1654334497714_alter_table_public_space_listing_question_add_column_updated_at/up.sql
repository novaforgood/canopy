alter table "public"."space_listing_question" add column "updated_at" timestamptz
 not null default now();
