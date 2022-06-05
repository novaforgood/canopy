alter table "public"."connection_request" alter column "confirmed_at" drop not null;
alter table "public"."connection_request" add column "confirmed_at" timestamptz;
