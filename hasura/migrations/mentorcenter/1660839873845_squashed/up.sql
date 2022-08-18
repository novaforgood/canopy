
alter table "public"."space_listing_question" drop constraint "space_listing_question_space_id_listing_order_key";
alter table "public"."space_listing_question" add constraint "space_listing_question_listing_order_space_id_id_key" unique ("listing_order", "space_id", "id");

alter table "public"."space_listing_question" drop constraint "space_listing_question_listing_order_space_id_id_key";
alter table "public"."space_listing_question" add constraint "space_listing_question_space_id_id_key" unique ("space_id", "id");

alter table "public"."space_listing_question" drop constraint "space_listing_question_space_id_id_key";
