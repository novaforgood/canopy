import { useCurrentProfile } from "../hooks/useCurrentProfile";
import { useCurrentSpace } from "../hooks/useCurrentSpace";

import { Text } from "./atomic";
import { Dropdown } from "./Dropdown";
import { SpaceDropdown } from "./SpaceDropdown";

export function Navbar() {
  return (
    <div className="flex items-center justify-between mt-12">
      <SpaceDropdown />
      <Dropdown />
    </div>
  );
}
