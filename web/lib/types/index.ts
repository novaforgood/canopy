import {
  InputMaybe,
  Space_Listing_Question_Insert_Input,
  Space_Tag_Arr_Rel_Insert_Input,
  Space_Tag_Category_Insert_Input,
} from "../../generated/graphql";

import { Space_Tag_Insert_Input } from "./../../generated/graphql";

export type NewListingQuestion = Space_Listing_Question_Insert_Input & {
  id: string;
};

export type NewSpaceTag = Space_Tag_Insert_Input & { id: string };

export type NewTagCategory = Space_Tag_Category_Insert_Input & {
  id: string;
  space_tags?: InputMaybe<
    Space_Tag_Arr_Rel_Insert_Input & {
      data: Array<NewSpaceTag>;
    }
  >;
};
