alter table "public"."image"
  add constraint "image_uploader_user_id_fkey"
  foreign key ("uploader_user_id")
  references "public"."user"
  ("id") on update restrict on delete restrict;
