
alter table "public"."profile" drop column "listing_enabled" cascade;

CREATE TABLE "public"."profile_listing" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "profile_id" uuid NOT NULL, "public" boolean NOT NULL, PRIMARY KEY ("id") , FOREIGN KEY ("profile_id") REFERENCES "public"."profile"("id") ON UPDATE restrict ON DELETE restrict);
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE "public"."profile_listing_social_type" ("value" text NOT NULL, "description" text NOT NULL, PRIMARY KEY ("value") );

INSERT INTO profile_listing_social_type (value, description) VALUES
('LinkedIn', 'linkedin.com');

CREATE TABLE "public"."profile_listing_social" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "profile_listing_id" uuid NOT NULL, "type" text NOT NULL, "link" text NOT NULL, PRIMARY KEY ("id") , FOREIGN KEY ("profile_listing_id") REFERENCES "public"."profile_listing"("id") ON UPDATE restrict ON DELETE restrict, FOREIGN KEY ("type") REFERENCES "public"."profile_listing_social_type"("value") ON UPDATE restrict ON DELETE restrict);
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE "public"."image" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "url" text NOT NULL, "alt" text NOT NULL, PRIMARY KEY ("id") );
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE "public"."profile_listing_image" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "profile_listing_id" uuid NOT NULL, "image_id" uuid NOT NULL, PRIMARY KEY ("id") , FOREIGN KEY ("profile_listing_id") REFERENCES "public"."profile_listing"("id") ON UPDATE restrict ON DELETE restrict, FOREIGN KEY ("image_id") REFERENCES "public"."image"("id") ON UPDATE restrict ON DELETE restrict);
CREATE EXTENSION IF NOT EXISTS pgcrypto;

alter table "public"."image" alter column "alt" drop not null;

alter table "public"."image" drop column "alt" cascade;

CREATE TABLE "public"."space_listing_question" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "space_id" uuid NOT NULL, "title" text NOT NULL, "char_count" integer NOT NULL, PRIMARY KEY ("id") , FOREIGN KEY ("space_id") REFERENCES "public"."space"("id") ON UPDATE restrict ON DELETE restrict);
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE "public"."profile_listing_response" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "profile_listing_id" uuid NOT NULL, "space_listing_question_id" uuid NOT NULL, "response_html" text NOT NULL, PRIMARY KEY ("id") , FOREIGN KEY ("profile_listing_id") REFERENCES "public"."profile_listing"("id") ON UPDATE restrict ON DELETE restrict, FOREIGN KEY ("space_listing_question_id") REFERENCES "public"."space_listing_question"("id") ON UPDATE restrict ON DELETE restrict);
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE "public"."space_listing_attribute_type" ("value" text NOT NULL, "description" text NOT NULL, PRIMARY KEY ("value") );

comment on table "public"."space_listing_attribute_type" is E'space_attribute_type';

comment on table "public"."space_listing_attribute_type" is NULL;

alter table "public"."space_listing_attribute_type" rename to "space_attribute_type";

INSERT INTO "public"."space_attribute_type" (value, description) VALUES
('ListingQuestionsOrder', 'Order of questions in space listings');

CREATE TABLE "public"."space_attribute" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "space_id" uuid NOT NULL, "type" text NOT NULL, "value" jsonb NOT NULL, PRIMARY KEY ("id") , FOREIGN KEY ("type") REFERENCES "public"."space_attribute_type"("value") ON UPDATE restrict ON DELETE restrict, UNIQUE ("space_id", "type"));
CREATE EXTENSION IF NOT EXISTS pgcrypto;

alter table "public"."space_attribute"
  add constraint "space_attribute_space_id_fkey"
  foreign key ("space_id")
  references "public"."space"
  ("id") on update restrict on delete restrict;

alter table "public"."space_listing_question" add column "listing_order" integer
 not null;

alter table "public"."space_listing_question" add constraint "space_listing_question_space_id_listing_order_key" unique ("space_id", "listing_order");

DROP table "public"."space_attribute";

DROP table "public"."space_attribute_type";
