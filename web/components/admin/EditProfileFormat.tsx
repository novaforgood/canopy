import { useCallback, useEffect, useState } from "react";

import toast from "react-hot-toast";

import {
  Space_Tag_Constraint,
  Space_Tag_Update_Column,
  useUpsertSpaceProfileSchemaMutation,
} from "../../generated/graphql";
import { useCurrentSpace } from "../../hooks/useCurrentSpace";
import { Button } from "../atomic";

import { EditProfileSchema, EditProfileSchemaData } from "./EditProfileSchema";

export function EditProfileFormat() {
  const { currentSpace } = useCurrentSpace();

  const [data, setData] = useState<EditProfileSchemaData>({
    listingQuestions: [],
    tagCategories: [],
  });

  const [edited, setEdited] = useState(false);

  useEffect(() => {
    if (
      !currentSpace?.space_listing_questions ||
      !currentSpace?.space_tag_categories
    )
      return;

    setData({
      listingQuestions: currentSpace.space_listing_questions,
      tagCategories:
        currentSpace.space_tag_categories.map((category) => ({
          ...category,
          space_tags: { data: category.space_tags },
        })) ?? [],
    });
  }, [
    currentSpace?.space_listing_questions,
    currentSpace?.space_tag_categories,
  ]);

  const [loading, setLoading] = useState(false);
  const [_, upsertSpaceProfileSchema] = useUpsertSpaceProfileSchemaMutation();
  const saveChanges = useCallback(async () => {
    setLoading(true);
    await upsertSpaceProfileSchema({
      space_listing_questions: data.listingQuestions.map((question, index) => ({
        ...question,
        listing_order: index,
      })),
      space_tag_categories: data.tagCategories.map((category, index) => ({
        ...category,
        listing_order: index,
        space_tags: category.space_tags
          ? {
              data: category.space_tags.data,
              on_conflict: {
                constraint: Space_Tag_Constraint.SpaceTagPkey,
                update_columns: [
                  Space_Tag_Update_Column.Label,
                  Space_Tag_Update_Column.Deleted,
                ],
              },
            }
          : undefined,
      })),
    })
      .then(() => {
        setEdited(false);
        toast.success("Saved");
      })
      .catch((err) => {
        toast.error(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [data.listingQuestions, data.tagCategories, upsertSpaceProfileSchema]);

  return (
    <div className="w-full">
      <Button
        disabled={!edited}
        rounded
        onClick={saveChanges}
        loading={loading}
      >
        Save changes
      </Button>
      <div className="h-4"></div>
      <EditProfileSchema
        data={data}
        onChange={(newData) => {
          setEdited(true);
          setData(newData);
        }}
      />
    </div>
  );
}
