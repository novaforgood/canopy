import classNames from "classnames";

interface HtmlDusplayProps {
  html: string;
  className?: string;
}
export function HtmlDisplay(props: HtmlDusplayProps) {
  const { html, className } = props;

  const styles = classNames({
    "ProseMirror break-words w-full": true,
    [`${className}`]: true,
  });

  return (
    <article className={styles} dangerouslySetInnerHTML={{ __html: html }} />
  );
}
