interface HtmlDusplayProps {
  html: string;
}
export function HtmlDisplay(props: HtmlDusplayProps) {
  return (
    <article
      className="ProseMirror break-words w-full"
      dangerouslySetInnerHTML={{ __html: props.html }}
    />
  );
}
