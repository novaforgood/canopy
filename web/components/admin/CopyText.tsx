import { useClipboard } from "@mantine/hooks";
import classNames from "classnames";
import toast from "react-hot-toast";

export function CopyText({
  text,
  breakAll,
}: {
  text: string;
  breakAll?: boolean;
}) {
  const clipboard = useClipboard();

  return (
    <div className="flex items-center gap-4">
      <button
        className="font-medium"
        onClick={() => {
          clipboard.copy(text);
          toast.success("Copied to clipboard!");
        }}
      >
        Copy
      </button>
      <div
        className={classNames({
          "text-body2 sm:w-96": true,
          "break-all": breakAll,
          truncate: !breakAll,
        })}
      >
        {text}
      </div>
    </div>
  );
}
