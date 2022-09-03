import { Space_Tag_Status_Enum } from "./../generated/graphql";

/**
 *
 * @param tag
 * @param tagCategory
 * @returns true if the tag should be shown on a profile listing
 */
export function showTagOnProfile(
  tag: { status: Space_Tag_Status_Enum },
  tagCategory: { rigid_select: boolean }
) {
  if (tagCategory.rigid_select) {
    return tag.status === Space_Tag_Status_Enum.Accepted;
  } else {
    return tag.status !== Space_Tag_Status_Enum.Deleted;
  }
}

/**
 *
 * @param tag
 * @returns true if the tag is official, meaning it shows on the homepage filters
 */
export function isTagOfficial(tag: { status: Space_Tag_Status_Enum }) {
  return tag.status === Space_Tag_Status_Enum.Accepted;
}
