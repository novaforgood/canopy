import { useCurrentSpace } from "../hooks/useCurrentSpace";

import { Text } from "./atomic";
import { Dropdown } from "./Dropdown";

export function Navbar() {
  const { currentSpace } = useCurrentSpace();
  return (
    <div className="flex items-center justify-between mt-12">
      <Text variant="heading3">{currentSpace?.name}</Text>
      <Dropdown />
    </div>
  );
}
