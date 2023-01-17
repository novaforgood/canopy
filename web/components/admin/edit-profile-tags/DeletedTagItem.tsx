import { NewSpaceTag } from "../../../lib/types";
import { Button, Text } from "../../atomic";

interface DeletedTagItemProps {
  tag: NewSpaceTag;
  count: number;
  onRestore: () => void;
}

export function DeletedTagItem(props: DeletedTagItemProps) {
  const { tag, onRestore, count } = props;

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
        <Button variant="secondary" size="small" onClick={onRestore}>
          Restore
        </Button>
      </div>
    </div>
  );
}
