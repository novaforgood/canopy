import { NewSpaceTag } from "../../../lib/types";
import { Button, Text } from "../../atomic";
import { ApproveButton } from "../../buttons/ApproveButton";
import { DenyButton } from "../../buttons/DenyButton";
import { DeleteButton } from "../../DeleteButton";

interface DeletedTagItemProps {
  tag: NewSpaceTag;
  count: number;
  onRestore: () => void;
}

export function DeletedTagItem(props: DeletedTagItemProps) {
  const { tag, onRestore, count } = props;

  return (
    <div className="flex justify-between gap-3 items-center w-full">
      <div className="flex-1 flex jitems-center p-1.5 bg-lime-100 rounded-full">
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
      </div>
      <div className="flex items-center gap-2">
        <Button variant="secondary" size="small" onClick={onRestore}>
          Restore
        </Button>
      </div>
    </div>
  );
}
