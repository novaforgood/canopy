alter table "public"."image" alter column "alt" drop not null;
alter table "public"."image" add column "alt" text;
