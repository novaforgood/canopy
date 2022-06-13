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
      <a href={link}>{link}</a>
    </div>
  );
}
