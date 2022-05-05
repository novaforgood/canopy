alter table "public"."spaces" add constraint "check_name_length" check (length(name) > 3);
