import { ReactNode, useState } from "react";

import classNames from "classnames";
import { useRouter } from "next/router";

import { Text } from "../../../components/atomic";
import { PageNotFound } from "../../../components/error-screens/PageNotFound";
import { Navbar } from "../../../components/Navbar";
import { SidePadding } from "../../../components/SidePadding";
import { SpaceLandingPage } from "../../../components/space-homepage/SpaceLandingPage";
import { SpaceSplashPage } from "../../../components/space-homepage/SpaceSplashPage";
import {
  BxEnvelope,
  BxGroup,
  BxLike,
  BxX,
} from "../../../generated/icons/regular";
import { useCurrentProfile } from "../../../hooks/useCurrentProfile";
import { useCurrentSpace } from "../../../hooks/useCurrentSpace";
import { CustomPage } from "../../../types";

interface IconTipProps {
  icon: ReactNode;
  tip: string;
}
function IconTip(props: IconTipProps) {
  const { icon, tip } = props;

  return (
    <div className="flex items-center gap-4">
      <div className="border border-green-900 rounded-full w-10 h-10 p-2 shrink-0">
        {icon}
      </div>
      <Text>{tip}</Text>
    </div>
  );
}

function CollapsibleTipsBar() {
  const [visible, setVisible] = useState(true);

  const styles = classNames({
    hidden: !visible,
  });

  return (
    <div className={styles}>
      <div className="bg-lime-100 border-b border-gray-600 text-green-800 w-full py-4 relative">
        <SidePadding className="">
          <div className="grid grid-rows sm:grid-cols-3 gap-4 sm:gap-8">
            <IconTip
              icon={<BxGroup />}
              tip="Browse the community directory below"
            />
            <IconTip
              icon={<BxLike />}
              tip="Click the profile of someone you want to connect with"
            />
            <IconTip
              icon={<BxEnvelope />}
              tip="Contact them through the “Introduce Yourself” button!"
            />
          </div>
        </SidePadding>
        <button
          className="absolute top-0 right-0"
          onClick={() => {
            setVisible(false);
          }}
        >
          <BxX className="h-8 w-8 m-2 hover:text-green-700" />
        </button>
      </div>
    </div>
  );
}

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
      <div className="bg-olive-100 flex flex-col items-center border-b border-gray-600">
        <SidePadding>
          <Navbar />
          <div className="sm:h-16"></div>
          <SpaceSplashPage />
        </SidePadding>
        <div className="h-8 sm:hidden"></div>
      </div>
      <CollapsibleTipsBar />
      <div className="bg-gray-50">
        <div className="h-16"></div>
        <SidePadding className="min-h-screen">
          <SpaceLandingPage />
        </SidePadding>
      </div>
    </div>
  );
};

SpaceHomepage.requiredAuthorizations = [];

export default SpaceHomepage;
