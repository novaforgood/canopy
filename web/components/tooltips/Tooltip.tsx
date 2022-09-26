import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css"; // optional

interface TooltipProps {
  children: React.ReactElement;
  content: React.ReactNode | string;
  placement?: "top" | "bottom" | "left" | "right";
  // If array, it's [show, hide] in ms
  delayMs?: number | [number, number];

  enabled?: boolean;
}

export function Tooltip(props: TooltipProps) {
  const {
    children,
    content,
    placement = "top",
    delayMs = 0,
    enabled = true,
  } = props;

  if (!enabled) {
    return children;
  }

  return (
    <Tippy
      content={content}
      placement={placement}
      delay={delayMs}
      animateFill={true}
      inertia={true}
    >
      {children}
    </Tippy>
  );
}
