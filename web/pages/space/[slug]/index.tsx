import { useRouter } from "next/router";

import { Text } from "../../../components/atomic";
import { PageNotFound } from "../../../components/error-screens/PageNotFound";
import { Navbar } from "../../../components/Navbar";
import { SidePadding } from "../../../components/SidePadding";
import { SpaceLandingPage } from "../../../components/space-homepage/SpaceLandingPage";
import { SpaceSplashPage } from "../../../components/space-homepage/SpaceSplashPage";
import { BxLike } from "../../../generated/icons/regular";
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
    <div>
      <div className="bg-olive-100 flex flex-col items-center">
        <SidePadding>
          <Navbar />
          <div className="h-16"></div>
          <SpaceSplashPage />
        </SidePadding>
      </div>
      <div className="bg-lime-200 border-t border-b border-green-800 text-green-800 w-full py-4">
        <SidePadding>
          <div className="flex items-center gap-4">
            <div className="border border-green-900 rounded-full p-1.5">
              <BxLike className="h-6 w-6" />
            </div>
            <Text>Click the profile of someone you want to connect with</Text>
          </div>
        </SidePadding>
      </div>
      <div className="bg-gray-50">
        <SidePadding className="min-h-screen">
          <SpaceLandingPage />
        </SidePadding>
      </div>
    </div>
  );
};

SpaceHomepage.requiredAuthorizations = [];

export default SpaceHomepage;
