import { ReactNode, useState } from "react";

import classNames from "classnames";
import { useRouter } from "next/router";

import { Button, Text } from "../../../components/atomic";
import { PageNotFound } from "../../../components/error-screens/PageNotFound";
import { SidePadding } from "../../../components/layout/SidePadding";
import { Navbar } from "../../../components/Navbar";
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
import { LocalStorage, LocalStorageKey } from "../../../lib/localStorage";

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
      <Text variant="body2">{tip}</Text>
    </div>
  );
}

function CollapsibleTipsBar() {
  // hidden if already seen before
  const [hidden, setHidden] = useState(
    LocalStorage.get(LocalStorageKey.SpaceHomepageBannerClosed)
  );

  const styles = classNames({
    hidden: hidden,
  });

  return (
    <div className={styles}>
      <div className="bg-lime-100 border-b border-gray-600 text-green-800 w-full py-8 relative">
        <SidePadding className="">
          <div className="grid grid-rows sm:grid-cols-3 gap-4 sm:gap-12">
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
            setHidden(true);
            LocalStorage.set(LocalStorageKey.SpaceHomepageBannerClosed, true);
          }}
        >
          <BxX className="h-8 w-8 m-2 hover:text-green-700" />
        </button>
      </div>
    </div>
  );
}

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
      <Text variant="body2">{tip}</Text>
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
      <div className="bg-lime-100 border-b border-gray-600 text-green-800 w-full py-8 relative">
        <SidePadding className="">
          <div className="grid grid-rows sm:grid-cols-3 gap-4 sm:gap-12">
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
      <div className="bg-olive-100">
        <Navbar />
      </div>
      <SidePadding className="bg-olive-100 flex flex-col items-center border-b border-gray-600">
        <div className="sm:h-16"></div>
        <SpaceSplashPage />
        <div className="h-8 sm:hidden"></div>
      </SidePadding>
      <CollapsibleTipsBar />
      <SidePadding className="min-h-screen bg-gray-50">
        <div className="h-16"></div>
        <SpaceLandingPage />
        <div className="h-16"></div>
      </SidePadding>
      {/* <SidePadding className="bg-gray-100 border-t border-green-900 h-64 flex justify-center items-center">
        <div className="w-full h-full flex flex-col justify-center items-center">
          <Text variant="heading4">
            Having trouble connecting with someone?
          </Text>
          <div className="h-8"></div>
          <Text>Please contact _ (WIP)</Text>
        </div>
      </SidePadding> */}
    </div>
  );
};

SpaceHomepage.requiredAuthorizations = [];

export default SpaceHomepage;
