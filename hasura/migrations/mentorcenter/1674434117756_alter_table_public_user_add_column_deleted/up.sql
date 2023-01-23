alter table "public"."user" add column "deleted" boolean
 not null default 'false';
