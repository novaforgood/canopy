import { NewSpaceTag } from "../../../lib/types";
import { Text } from "../../atomic";
import { DeleteButton } from "../../DeleteButton";

interface ApprovedTagItemProps {
  tag: NewSpaceTag;
  count: number;
  onDelete: (deletedTagId: string) => void;
}

export function ApprovedTagItem(props: ApprovedTagItemProps) {
  const { tag, onDelete, count } = props;

  return (
    <div className="flex justify-between items-center p-2 bg-lime-100 rounded-full">
      <div className="flex items-center gap-3">
        <div className="rounded-full h-8 w-8 bg-lime-400 flex items-center justify-center">
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
