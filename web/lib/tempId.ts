import { nanoid } from "nanoid";

const TEMP_ID_SIZE = 21; // Make sure this is different from uuid size (which is 36)
const UUID_SIZE = 36; // length of uuid

export function getTempId() {
  return nanoid(TEMP_ID_SIZE);
}

export function isTempId(id: string) {
  return id.length !== UUID_SIZE;
}

/**
 * If the id is temporary or undefined | null, return undefined.
 *
 * Used when posting to the database--we want postgres to generate a new id for us.
 */
export function resolveId(id?: string | null) {
  console.log(id);
  if (!id) return undefined;
  return isTempId(id) ? undefined : id;
}
