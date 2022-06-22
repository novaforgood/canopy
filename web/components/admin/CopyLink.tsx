import { useClipboard } from "@mantine/hooks";

export function CopyLink({ link }: { link: string }) {
  const clipboard = useClipboard({ timeout: 500 });

  return (
    <div className="flex gap-4">
      <button
        onClick={() => {
          clipboard.copy(link);
        }}
      >
        {clipboard.copied ? "Copied!" : "Copy"}
      </button>
      <input
        readOnly
        className="w-96 truncate"
        value={link}
        contentEditable={false}
      ></input>
    </div>
  );
}
