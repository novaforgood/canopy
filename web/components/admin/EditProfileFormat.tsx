import { useCallback, useEffect, useState } from "react";

import toast from "react-hot-toast";

import {
  Space_Tag_Constraint,
  Space_Tag_Update_Column,
  useUpsertSpaceProfileSchemaMutation,
} from "../../generated/graphql";
import { useCurrentSpace } from "../../hooks/useCurrentSpace";
import { useSaveChangesState } from "../../hooks/useSaveChangesState";
import { resolveId } from "../../lib/tempId";
import { Button, Text } from "../atomic";
import {
  EditProfileSchema,
  EditProfileSchemaData,
} from "../edit-profile-schema/EditProfileSchema";

export function EditProfileFormat() {
  const { currentSpace, refetchCurrentSpace } = useCurrentSpace();

  const [data, setData] = useState<EditProfileSchemaData>({
    listingQuestions: [],
    tagCategories: [],
  });

  const { mustSave, setMustSave } = useSaveChangesState();

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
    setMustSave(false);
  }, [
    currentSpace?.space_listing_questions,
    currentSpace?.space_tag_categories,
    setMustSave,
  ]);

  // console.log(currentSpace?.space_listing_questions)

  const [loading, setLoading] = useState(false);
  const [_, upsertSpaceProfileSchema] = useUpsertSpaceProfileSchemaMutation();
  const saveChanges = useCallback(async () => {
    setLoading(true);
    await upsertSpaceProfileSchema({
      space_listing_questions: data.listingQuestions.map((question, index) => ({
        ...question,
        id: resolveId(question.id),
        listing_order: index,
      })),
      space_tag_categories: data.tagCategories.map((category, index) => ({
        ...category,
        id: resolveId(category.id),
        listing_order: index,
        space_tags: category.space_tags
          ? {
              data: category.space_tags.data.map((tag, index) => ({
                ...tag,
                id: resolveId(tag.id),
                listing_order: index,
              })),
              on_conflict: {
                constraint:
                  Space_Tag_Constraint.SpaceTagLabelSpaceTagCategoryIdKey,
                update_columns: [
                  Space_Tag_Update_Column.Label,
                  Space_Tag_Update_Column.Status,
                  Space_Tag_Update_Column.ListingOrder,
                ],
              },
            }
          : undefined,
      })),
    })
      .then((result) => {
        if (result.error) {
          toast.error(result.error.message);
        } else {
          toast.success("Saved");
          refetchCurrentSpace();
        }
      })
      .catch((err) => {
        toast.error(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [
    data.listingQuestions,
    data.tagCategories,
    refetchCurrentSpace,
    upsertSpaceProfileSchema,
  ]);

  return (
    <div className="w-full">
      {mustSave && (
        <>
          <Text variant="body2" style={{ color: "red" }}>
            You must click {'"Save Changes"'} down below for your changes to
            take effect.
          </Text>
        </>
      )}

      <div className="h-4"></div>
      <EditProfileSchema
        data={data}
        onChange={(newData) => {
          setMustSave(true);
          setData(newData);
        }}
      />
      <div className="h-8"></div>
      <Button
        disabled={!mustSave}
        rounded
        onClick={saveChanges}
        loading={loading}
      >
        Save changes
      </Button>
      {/* <CatchUnsavedChangesModal unsavedChangesExist={edited} /> */}
    </div>
  );
}
