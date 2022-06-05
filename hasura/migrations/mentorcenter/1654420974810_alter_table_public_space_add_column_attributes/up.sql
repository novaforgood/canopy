alter table "public"."space" add column "attributes" jsonb
 not null default jsonb_build_object();
