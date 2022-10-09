CREATE TRIGGER before_insert_event_profile_view_trigger
   BEFORE INSERT
   ON event_profile_view
   FOR EACH ROW
   EXECUTE PROCEDURE run_before_insert_event_profile_view();
