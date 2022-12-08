alter table "public"."profile" add column "attributes" jsonb
 not null default jsonb_build_object();
