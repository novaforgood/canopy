alter table "public"."spaces" drop constraint "check_name_length";
alter table "public"."spaces" add constraint "check_name_length" check (CHECK (length(name) > 3));
