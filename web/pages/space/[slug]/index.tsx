import { useRouter } from "next/router";

import { Navbar } from "../../../components/Navbar";
import { SidePadding } from "../../../components/SidePadding";
import { SpaceLandingPage } from "../../../components/space-homepage/SpaceLandingPage";
import { useCurrentProfile } from "../../../hooks/useCurrentProfile";
import { useCurrentSpace } from "../../../hooks/useCurrentSpace";

export default function SpaceHomepage() {
  const router = useRouter();

  const { currentSpace, fetchingCurrentSpace } = useCurrentSpace();
  const { currentProfile, fetchingCurrentProfile } = useCurrentProfile();

  if (fetchingCurrentProfile || fetchingCurrentSpace) {
    return <div>Loading...</div>;
  }

  if (!currentSpace) {
    return <div>404 - Space not found</div>;
  }

  if (!currentProfile) {
    return <div>Ur not in this space lol</div>;
  }

  return (
    <SidePadding>
      <Navbar />
      <SpaceLandingPage />
    </SidePadding>
  );
}
