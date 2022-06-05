import { useRouter } from "next/router";

import { PageNotFound } from "../../../components/error-screens/PageNotFound";
import { Navbar } from "../../../components/Navbar";
import { SidePadding } from "../../../components/SidePadding";
import { SpaceLandingPage } from "../../../components/space-homepage/SpaceLandingPage";
import { useCurrentProfile } from "../../../hooks/useCurrentProfile";
import { useCurrentSpace } from "../../../hooks/useCurrentSpace";
import { CustomPage } from "../../../types";

const SpaceHomepage: CustomPage = () => {
  const { currentSpace, fetchingCurrentSpace } = useCurrentSpace();

  if (fetchingCurrentSpace) {
    return <div>Loading...</div>;
  }

  if (!currentSpace) {
    return <PageNotFound />;
  }

  return (
    <SidePadding>
      <Navbar />
      <SpaceLandingPage />
    </SidePadding>
  );
};

SpaceHomepage.requiredAuthorizations = [];

export default SpaceHomepage;
