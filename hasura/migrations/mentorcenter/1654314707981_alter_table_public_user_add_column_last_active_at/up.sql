alter table "public"."user" add column "last_active_at" timestamptz
 not null default now();
