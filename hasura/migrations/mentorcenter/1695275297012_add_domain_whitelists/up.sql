DROP VIEW "public"."public_space";

CREATE OR REPLACE VIEW "public"."public_space" AS 
 SELECT space.id,
    space.name,
    space.slug,
    space.deleted,
    space.attributes->>'domainWhitelist' as "domainWhitelist",
    space.attributes->'domainWhitelists' as "domainWhitelists"
   FROM space;
