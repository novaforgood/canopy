alter table "public"."space_tag" add constraint "space_tag_label_space_tag_category_id_key" unique ("label", "space_tag_category_id");
