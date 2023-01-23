CREATE OR REPLACE VIEW "public"."public_space" AS 
 SELECT space.id,
    space.name,
    space.slug,
    space.deleted
   FROM space;
