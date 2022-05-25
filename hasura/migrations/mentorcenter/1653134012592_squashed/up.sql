
INSERT INTO profile_listing_social_type VALUES
('Instagram', 'instagram.com'),
('Twitter', 'twitter.com');

alter table "public"."profile_listing_social" add constraint "profile_listing_social_type_profile_listing_id_key" unique ("type", "profile_listing_id");

DELETE FROM image;

alter table "public"."image" add column "uploader_user_id" text
 not null;

alter table "public"."image"
  add constraint "image_uploader_user_id_fkey"
  foreign key ("uploader_user_id")
  references "public"."user"
  ("id") on update restrict on delete restrict;

alter table "public"."profile_listing_image" add constraint "profile_listing_image_profile_listing_id_image_id_key" unique ("profile_listing_id", "image_id");

alter table "public"."profile_listing_image" drop constraint "profile_listing_image_profile_listing_id_image_id_key";
alter table "public"."profile_listing_image" add constraint "profile_listing_image_profile_listing_id_key" unique ("profile_listing_id");
