alter table "public"."connection_request" alter column "confirmed" set default false;
alter table "public"."connection_request" alter column "confirmed" drop not null;
alter table "public"."connection_request" add column "confirmed" bool;
