import { NewSpaceTag } from "../../../lib/types";
import { Text } from "../../atomic";
import { DeleteButton } from "../../common/DeleteButton";

interface ApprovedTagItemProps {
  tag: NewSpaceTag;
  count: number;
  onDelete: (deletedTagId: string) => void;
}

export function ApprovedTagItem(props: ApprovedTagItemProps) {
  const { tag, onDelete, count } = props;

  return (
    <div className="flex items-center justify-between rounded-full bg-lime-100 p-2">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-lime-400">
          <Text medium variant={count >= 1000 ? "body4" : "body3"}>
            {count}
          </Text>
        </div>
        <Text medium variant="body2">
          {tag.label}
        </Text>
      </div>
      <DeleteButton
        className="mr-2"
        variant="outline"
        onClick={() => onDelete(tag.id)}
      ></DeleteButton>
    </div>
  );
}
