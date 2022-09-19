import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css"; // optional

interface TooltipProps {
  children: React.ReactElement;
  content: React.ReactNode | string;
  placement?: "top" | "bottom" | "left" | "right";
  // If array, it's [show, hide] in ms
  delayMs?: number | [number, number];
}

export function Tooltip(props: TooltipProps) {
  const { children, content, placement = "top", delayMs = 0 } = props;

  return (
    <Tippy content={content} placement={placement} delay={delayMs}>
      {children}
    </Tippy>
  );
}
