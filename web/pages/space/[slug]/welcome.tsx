import { useRouter } from "next/router";

import { Button, Text } from "../../../components/atomic";
import { StepDisplay } from "../../../components/create-profile/StepDisplay";
import { TwoThirdsPageLayout } from "../../../components/TwoThirdsPageLayout";
import { useCurrentSpace } from "../../../hooks/useCurrentSpace";

const WelcomePage = () => {
  const router = useRouter();
  const { currentSpace } = useCurrentSpace();

  return (
    <TwoThirdsPageLayout>
      <div className="h-screen flex flex-col items-start pt-16 sm:pt-32 px-6 sm:px-16 w-full sm:max-w-2xl">
        <Text variant="heading2" mobileVariant="heading3">
          Welcome to {currentSpace?.name}!
        </Text>

        <div className="h-12"></div>
        <Text className="text-gray-600">Here are your next steps:</Text>
        <div className="h-8"></div>
        <div className="w-full sm:w-160 flex flex-col gap-4">
          <StepDisplay
            stepNumber={1}
            title="Complete your profile"
            description="It takes 3 minutes, and your profile can be edited or unpublished at any time."
          />
          <StepDisplay
            stepNumber={2}
            title="Publish your profile in the community directory"
            description="Other community members will reach out to you through a profile contact button"
          />
          <StepDisplay
            stepNumber={3}
            title="Wait for a connection request!"
            description="Whenever someone reaches out, you will be notified via email. Please respond promptly to schedule a meeting time"
          />
        </div>
        <div className="h-16"></div>
        <Button
          variant="primary"
          rounded
          onClick={() => {
            router.push(`/space/${currentSpace?.slug}`);
          }}
        >
          Create my profile
        </Button>

        <div className="h-40"></div>
      </div>
    </TwoThirdsPageLayout>
  );
};

export default WelcomePage;
