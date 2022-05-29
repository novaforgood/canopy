import React from "react";

import { faker } from "@faker-js/faker";

import Tag from "../../../components/atomic/Tag";
import {
  useSpaceTagCategoriesQuery,
  useProfileListingToSpaceTagQuery,
} from "../../../generated/graphql";
import { useCurrentProfile } from "../../../hooks/useCurrentProfile";
import { useCurrentSpace } from "../../../hooks/useCurrentSpace";

const space_tags = new Array(8).fill(0).map(() => {
  return { tag: faker.lorem.word() };
});

const categories = new Array(2).fill(0).map(() => {
  return { space_tags };
});

export default function TagTest() {
  const { currentSpace } = useCurrentSpace();
  const { currentProfile } = useCurrentProfile();

  const [{ data: spaceTagCategoriesData }] = useSpaceTagCategoriesQuery({
    variables: { space_id: currentSpace?.id ?? "" },
  });

  const [{ data: profileTags }] = useProfileListingToSpaceTagQuery({
    variables: {
      profile_id: currentProfile?.id ?? "",
    },
  });

  return (
    <div>
      {spaceTagCategoriesData?.space_tag_category.map((category) => {
        return (
          <div key={category.id}>
            <div className="text-xl">{category.title}</div>
            <div className="h-4"></div>
            <div className="flex gap-2 items-start">
              {profileTags?.profile_listing_to_space_tag.map((tag) => {
                return (
                  <Tag
                    key={tag.space_tag.label}
                    className="p-2 border"
                    onClick={() => {
                      console.log("clicked");
                    }}
                  >
                    <span>{tag.space_tag.label}</span>
                  </Tag>
                );
              })}
            </div>
            <div className="h-16"></div>
          </div>
        );
      })}
    </div>
  );
}
