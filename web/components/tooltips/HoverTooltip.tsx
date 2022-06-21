import { useState } from "react";

import { Tooltip, TooltipProps } from "./Tooltip";

export function HoverTooltip(props: Omit<TooltipProps, "show">) {
  const { children, tooltipText } = props;
  const [show, setShow] = useState(false);
  return (
    <Tooltip show={show} tooltipText={tooltipText}>
      <div
        onPointerEnter={() => setShow(true)}
        onPointerLeave={() => setShow(false)}
      >
        {children}
      </div>
    </Tooltip>
  );
}
