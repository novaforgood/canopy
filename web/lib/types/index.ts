import {
  InputMaybe,
  Space_Listing_Question_Insert_Input,
  Space_Tag_Arr_Rel_Insert_Input,
  Space_Tag_Category_Insert_Input,
  Space_Tag_Status_Enum,
} from "../../generated/graphql";

import { Space_Tag_Insert_Input } from "./../../generated/graphql";

type Modify<T, R> = Omit<T, keyof R> & R;

export type NewListingQuestion = Modify<
  Space_Listing_Question_Insert_Input,
  { id: string }
>;

export type NewSpaceTag = Modify<
  Space_Tag_Insert_Input,
  { id: string; status: Space_Tag_Status_Enum }
>;

export type NewTagCategory = Modify<
  Space_Tag_Category_Insert_Input,
  {
    id: string;
    rigid_select: boolean;
    space_tags?: InputMaybe<
      Modify<Space_Tag_Arr_Rel_Insert_Input, { data: Array<NewSpaceTag> }>
    >;
  }
>;
