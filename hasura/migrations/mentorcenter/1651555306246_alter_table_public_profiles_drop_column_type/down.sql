alter table "public"."profiles" alter column "type" drop not null;
alter table "public"."profiles" add column "type" text;
