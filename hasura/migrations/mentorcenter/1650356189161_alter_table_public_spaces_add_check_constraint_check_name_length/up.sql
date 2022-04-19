alter table "public"."spaces" drop constraint "check_name_length";
alter table "public"."spaces" add constraint "check_name_length" check (length(name) >= 1 AND length(name) <= 50);
