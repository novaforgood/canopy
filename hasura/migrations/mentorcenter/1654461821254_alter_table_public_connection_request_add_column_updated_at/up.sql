alter table "public"."connection_request" add column "updated_at" timestamptz
 null default now();
