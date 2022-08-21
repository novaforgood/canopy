import {
  Space_Listing_Question_Insert_Input,
  Space_Tag_Category_Insert_Input,
} from "../../generated/graphql";

export type NewListingQuestion = Space_Listing_Question_Insert_Input & {
  id: string;
};

export type NewTagCategory = Space_Tag_Category_Insert_Input & { id: string };
