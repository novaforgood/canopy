import { useCallback, useEffect, useState } from "react";

import { useUpsertSpaceProfileSchemaMutation } from "../../generated/graphql";
import { useCurrentSpace } from "../../hooks/useCurrentSpace";
import { Button } from "../atomic";

import { EditProfileSchema, EditProfileSchemaData } from "./EditProfileSchema";

export function EditProfileFormat() {
  const { currentSpace } = useCurrentSpace();

  const [data, setData] = useState<EditProfileSchemaData>({
    listingQuestions: [],
    tagCategories: [],
  });

  useEffect(() => {
    if (!currentSpace) return;

    setData({
      listingQuestions: currentSpace.space_listing_questions ?? [],
      tagCategories:
        currentSpace.space_tag_categories.map((category) => ({
          ...category,
          space_tags: { data: category.space_tags },
        })) ?? [],
    });
  }, [currentSpace]);

  const [_, upsertSpaceProfileSchema] = useUpsertSpaceProfileSchemaMutation();
  const saveChanges = useCallback(async () => {
    await upsertSpaceProfileSchema({
      space_listing_questions: data.listingQuestions,
      space_tag_categories: data.tagCategories.map((category) => ({
        ...category,
        space_tags: undefined,
      })),
    });
  }, [data.listingQuestions, data.tagCategories, upsertSpaceProfileSchema]);

  return (
    <div className="w-full">
      <Button rounded onClick={saveChanges}>
        Save changes
      </Button>
      <EditProfileSchema data={data} onChange={setData} />
    </div>
  );
}
