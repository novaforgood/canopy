import { useRouter } from "next/router";

import { Button, Text } from "../../../components/atomic";
import { StepDisplay } from "../../../components/create-profile/StepDisplay";
import { TwoThirdsPageLayout } from "../../../components/layout/TwoThirdsPageLayout";
import { useCurrentSpace } from "../../../hooks/useCurrentSpace";
import { CustomPage } from "../../../types";

function ListerWelcomePage() {
  const router = useRouter();
  const { currentSpace } = useCurrentSpace();

  return (
    <TwoThirdsPageLayout>
      <div className="flex max-w-2xl flex-col items-start justify-start px-16 pt-12 sm:h-screen sm:pt-24">
        <Text variant="heading2" mobileVariant="heading3">
          Welcome to {currentSpace?.name}!
        </Text>

        <div className="h-12"></div>
        <Text className="text-gray-600">Here are your next steps:</Text>
        <div className="h-8"></div>
        <div className="flex w-full flex-col gap-4 sm:w-160">
          <StepDisplay
            stepNumber={1}
            title="Complete your profile"
            description="It takes 2 minutes, and your profile can be edited at any time."
            highlighted
          />
          <StepDisplay
            stepNumber={2}
            title="Publish your profile in the community directory"
            description="Other community members will be able to read your profile, send you messages on Canopy, or reach out through your other linked accounts."
          />
          <StepDisplay
            stepNumber={3}
            title="Reach out to others!"
            description="Send a message to someone else introducing yourself or asking about something on their profile. You will be notified via email when someone starts a chat with you. Be sure to regularly check your junk folder!"
          />
        </div>
        <div className="h-16"></div>
        <Button
          variant="primary"
          rounded
          onClick={() => {
            router.push(`/space/${currentSpace?.slug}/create-profile`);
          }}
        >
          Create my profile
        </Button>

        <div className="h-40"></div>
      </div>
    </TwoThirdsPageLayout>
  );
}
const WelcomePage: CustomPage = () => {
  return <ListerWelcomePage />;
};

WelcomePage.showFooter = false;

export default WelcomePage;
