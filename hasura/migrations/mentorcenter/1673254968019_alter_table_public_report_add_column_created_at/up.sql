alter table "public"."report" add column "created_at" timestamptz
 not null default now();
