import { useClipboard } from "@mantine/hooks";
import classNames from "classnames";
import toast from "react-hot-toast";
import { Button } from "../atomic";

export function CopyText({
  text,
  breakAll,
}: {
  text: string;
  breakAll?: boolean;
}) {
  const clipboard = useClipboard();

  return (
    <div className="flex flex-col items-start gap-2">
      <Button
        variant="outline"
        size="small"
        // className="font-medium underline"
        onClick={() => {
          clipboard.copy(text);
          toast.success("Copied to clipboard!");
        }}
      >
        Copy
      </Button>
      <div className="relative w-full sm:w-96">
        {/* Dummy placeholder for sizing */}
        <pre className="pointer-events-none max-h-80 w-full overflow-hidden font-sans opacity-0">
          {text}
        </pre>
        <textarea
          onDoubleClick={(e) => {
            e.preventDefault();
            e.currentTarget.select();
          }}
          value={text}
          className={classNames({
            "absolute left-0 top-0 h-full max-h-80 w-full overflow-y-auto font-sans text-body2":
              true,
            "break-all": breakAll,
            truncate: !breakAll,
          })}
        ></textarea>
        <div className="pointer-events-none absolute bottom-0 h-10 w-full bg-gradient-to-b from-white to-gray-300 opacity-30"></div>
      </div>
    </div>
  );
}
