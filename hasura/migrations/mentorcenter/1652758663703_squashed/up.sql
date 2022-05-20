
alter table "public"."profile_listing" add constraint "profile_listing_profile_id_key" unique ("profile_id");

alter table "public"."profile_listing_response" add constraint "profile_listing_response_space_listing_question_id_profile_listing_id_key" unique ("space_listing_question_id", "profile_listing_id");

alter table "public"."profile_listing" alter column "public" set default 'False';
