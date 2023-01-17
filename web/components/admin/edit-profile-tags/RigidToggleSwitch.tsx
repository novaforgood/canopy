import toast from "react-hot-toast";

import {
  useTagCategoryRigidSelectQuery,
  useUpdateSpaceTagCategoryMutation,
} from "../../../generated/graphql";
import { CheckBox } from "../../atomic/CheckBox";

interface RigidToggleSwitchProps {
  tagCategoryId: string;
}
export default function RigidToggleSwitch(props: RigidToggleSwitchProps) {
  const { tagCategoryId } = props;

  const [{ data, fetching }] = useTagCategoryRigidSelectQuery({
    variables: { tag_category_id: tagCategoryId },
  });

  const [_, updateSpaceTagCategory] = useUpdateSpaceTagCategoryMutation();

  const isRigid = data?.space_tag_category_by_pk?.rigid_select ?? false;
  const title = data?.space_tag_category_by_pk?.title ?? "";

  if (fetching) return null;

  return (
    <div className="flex items-center gap-4">
      <CheckBox
        checked={!isRigid}
        onChange={async (newVal) => {
          toast.promise(
            updateSpaceTagCategory({
              space_tag_category_id: tagCategoryId,
              variables: {
                rigid_select: !newVal,
              },
            }),
            {
              loading: "Loading",
              success: "Successfully updated",
              error: `Error when editing tag field "${title}"`,
            }
          );
        }}
        label={`Allow anyone to suggest tags for "${title}"`}
      ></CheckBox>
    </div>
  );
}
