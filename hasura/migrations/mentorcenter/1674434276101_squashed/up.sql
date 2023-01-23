
alter table "public"."profile" alter column "user_id" drop not null;

alter table "public"."space"
  add constraint "space_owner_id_fkey"
  foreign key ("owner_id")
  references "public"."user"
  ("id") on update restrict on delete restrict;

alter table "public"."space" add column "deleted" boolean
 not null default 'false';

alter table "public"."space" add column "updated_at" timestamptz
 not null default now();

CREATE OR REPLACE FUNCTION "public"."set_current_timestamp_updated_at"()
RETURNS TRIGGER AS $$
DECLARE
  _new record;
BEGIN
  _new := NEW;
  _new."updated_at" = NOW();
  RETURN _new;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER "set_public_space_updated_at"
BEFORE UPDATE ON "public"."space"
FOR EACH ROW
EXECUTE PROCEDURE "public"."set_current_timestamp_updated_at"();
COMMENT ON TRIGGER "set_public_space_updated_at" ON "public"."space" 
IS 'trigger to set value of column "updated_at" to current timestamp on row update';

alter table "public"."profile_listing_social" drop constraint "profile_listing_social_profile_listing_id_fkey",
  add constraint "profile_listing_social_profile_listing_id_fkey"
  foreign key ("profile_listing_id")
  references "public"."profile_listing"
  ("id") on update restrict on delete cascade;

alter table "public"."profile_listing_response" drop constraint "profile_listing_response_profile_listing_id_fkey",
  add constraint "profile_listing_response_profile_listing_id_fkey"
  foreign key ("profile_listing_id")
  references "public"."profile_listing"
  ("id") on update restrict on delete cascade;

alter table "public"."profile_listing_image" drop constraint "profile_listing_image_profile_listing_id_fkey",
  add constraint "profile_listing_image_profile_listing_id_fkey"
  foreign key ("profile_listing_id")
  references "public"."profile_listing"
  ("id") on update restrict on delete cascade;

CREATE OR REPLACE VIEW "public"."public_space" AS 
 SELECT space.id,
    space.name,
    space.slug,
    space.deleted
   FROM space;

alter table "public"."user" add column "deleted" boolean
 not null default 'false';

alter table "public"."user" add column "updated_at" timestamptz
 not null default now();

CREATE OR REPLACE FUNCTION "public"."set_current_timestamp_updated_at"()
RETURNS TRIGGER AS $$
DECLARE
  _new record;
BEGIN
  _new := NEW;
  _new."updated_at" = NOW();
  RETURN _new;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER "set_public_user_updated_at"
BEFORE UPDATE ON "public"."user"
FOR EACH ROW
EXECUTE PROCEDURE "public"."set_current_timestamp_updated_at"();
COMMENT ON TRIGGER "set_public_user_updated_at" ON "public"."user" 
IS 'trigger to set value of column "updated_at" to current timestamp on row update';
