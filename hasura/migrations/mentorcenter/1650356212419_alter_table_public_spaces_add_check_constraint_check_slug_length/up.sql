alter table "public"."spaces" add constraint "check_slug_length" check (length(slug) >= 1 AND length(slug) <= 60);
