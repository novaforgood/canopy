alter table "public"."connection_request"
  add constraint "connection_request_status_fkey"
  foreign key ("status")
  references "public"."connection_request_status"
  ("value") on update restrict on delete restrict;
