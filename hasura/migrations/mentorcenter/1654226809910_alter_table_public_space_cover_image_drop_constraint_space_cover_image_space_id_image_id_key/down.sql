alter table "public"."space_cover_image" add constraint "space_cover_image_image_id_space_id_key" unique ("image_id", "space_id");
