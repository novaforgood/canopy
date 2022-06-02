import { useRouter } from "next/router";

import { PageNotFound } from "../../../components/error-screens/PageNotFound";
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

  if (!currentSpace || !currentProfile) {
    return <PageNotFound />;
  }

  return (
    <SidePadding>
      <Navbar />
      <SpaceLandingPage />
    </SidePadding>
  );
}
