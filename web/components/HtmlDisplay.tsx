import classNames from "classnames";
import DOMPurify, { Config } from "dompurify";

// only allow tags possible from the tiptap editor.
// (bold, italics, h1, h2, links)
const DOMPURIFY_CONFIG: Config = {
  ALLOWED_TAGS: ["p", "strong", "em", "h1", "h2", "a"],
};

interface HtmlDisplayProps {
  html: string;
  className?: string;
}
export function HtmlDisplay(props: HtmlDisplayProps) {
  const { html, className } = props;
  const cleanHTML = DOMPurify.sanitize(html, DOMPURIFY_CONFIG) as string;

  const styles = classNames({
    "ProseMirror break-words w-full overflow-hidden": true,
    [`${className}`]: true,
  });

  return (
    <article
      className={styles}
      dangerouslySetInnerHTML={{
        __html: cleanHTML,
      }}
    />
  );
}
