alter table "public"."profile" alter column "listing_enabled" drop not null;
alter table "public"."profile" add column "listing_enabled" bool;
