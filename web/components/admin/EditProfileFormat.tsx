import { useEffect, useState } from "react";

import { useCurrentSpace } from "../../hooks/useCurrentSpace";

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

  return (
    <div className="w-full">
      <EditProfileSchema data={data} onChange={setData} />
    </div>
  );
}
