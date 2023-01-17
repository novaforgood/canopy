import { NewSpaceTag } from "../../../lib/types";
import { Text } from "../../atomic";
import { ApproveButton } from "../../buttons/ApproveButton";
import { DenyButton } from "../../buttons/DenyButton";

interface PendingTagItemProps {
  tag: NewSpaceTag;
  count: number;
  onApprove: () => void;
  onDeny: () => void;
}

export function PendingTagItem(props: PendingTagItemProps) {
  const { tag, onApprove, onDeny, count } = props;

  return (
    <div className="flex w-full items-center justify-between gap-3">
      <div className="jitems-center flex flex-1 rounded-full bg-lime-100 p-1.5">
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
      </div>
      <div className="flex items-center gap-2">
        <ApproveButton onClick={onApprove} />
        <DenyButton onClick={onDeny} />
      </div>
    </div>
  );
}
