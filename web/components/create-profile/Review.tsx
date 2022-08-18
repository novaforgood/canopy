import React, { useState } from "react";

import { useDisclosure } from "@mantine/hooks";
import toast from "react-hot-toast";

import { Button, Modal, Text } from "../../components/atomic";
import {
  Profile_Listing_Update_Column,
  useUpsertProfileListingMutation,
} from "../../generated/graphql";
import { useCurrentProfile } from "../../hooks/useCurrentProfile";
import { EditProfileListing } from "../EditProfileListing";

import { StageDisplayWrapper } from "./StageDisplayWrapper";
import { StepDisplay } from "./StepDisplay";

interface ReviewProps {
  onComplete: () => void;
}

export function Review(props: ReviewProps) {
  const { onComplete } = props;

  const { currentProfile } = useCurrentProfile();

  const [_, upsertProfileListing] = useUpsertProfileListingMutation();

  const [publishModalOpened, publishModalHandlers] = useDisclosure(false);
  const [loadingPublish, setLoadingPublish] = useState(false);

  const [savedModalOpened, savedModalHandlers] = useDisclosure(false);

  return (
    <StageDisplayWrapper
      title="Yay, you did it! Next steps:"
      showActions={false}
    >
      <div className="flex flex-col items-start">
        <div className="h-8"></div>
        <div className="w-full sm:w-160 flex flex-col gap-4">
          <StepDisplay
            stepNumber={1}
            title="Review your profile below"
            description="Review and edit any section by clicking the tabs on the left. You can also returning to your account settings at any time to make changes."
          />
          <StepDisplay
            stepNumber={2}
            title="Publish your profile!"
            description="Once you click “Publish,” this profile page will appear in the community directory."
            secondaryDescription="By publishing your profile, you are making it possible for others in
            your community to reach out to you. Please always keep interactions
            respectful and know that you never have to respond if you don’t want
            to."
          />
        </div>
        <div className="h-4"></div>

        <Text variant="body2" className="text-gray-400"></Text>
        <div className="h-8"></div>
        <EditProfileListing showPublishedToggle={false} />
        <div className="h-16"></div>

        <div className="flex">
          <Button
            variant="primary"
            rounded
            className="flex items-center justify-center"
            loading={loadingPublish}
            onClick={async () => {
              if (!currentProfile) {
                toast.error("No current profile");
                return;
              }
              setLoadingPublish(true);
              await upsertProfileListing({
                profile_listing: {
                  profile_id: currentProfile.id,
                  public: true,
                },
                update_columns: [Profile_Listing_Update_Column.Public],
              });
              setLoadingPublish(false);
              publishModalHandlers.open();
            }}
          >
            Publish my profile
          </Button>
          <Button
            variant="secondary"
            rounded
            className="flex items-center justify-center"
            onClick={savedModalHandlers.open}
          >
            Save without publishing
          </Button>
        </div>
        <div className="h-8"></div>
        <div className="max-w-3xl">
          <Text variant="body2" className="text-gray-600">
            Don’t worry, you can always edit your profile later!
          </Text>
        </div>

        <Modal isOpen={publishModalOpened} onClose={() => {}}>
          <div className="bg-white px-12 pt-16 pb-8 rounded-md">
            <div className="w-56 flex flex-col items-center">
              <Text variant="heading4">Your profile is live!</Text>
              <div className="h-8"></div>
              <Text>Check out the homepage to see your published profile.</Text>
              <div className="h-12"></div>
              <Button onClick={onComplete} rounded>
                Go to homepage
              </Button>
              <div className="h-16"></div>
              <img
                src="/assets/create-profile/many_trees.svg"
                alt="many trees"
              />
            </div>
          </div>
        </Modal>

        <Modal isOpen={savedModalOpened} onClose={() => {}}>
          <div className="bg-white px-12 py-16 rounded-md">
            <div className="w-56 flex flex-col items-center">
              <Text variant="heading4">Profile saved!</Text>
              <div className="h-8"></div>
              <Text>
                Check out the homepage to see other profiles in the space.
              </Text>
              <div className="h-12"></div>
              <Button onClick={onComplete} rounded>
                Go to homepage
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </StageDisplayWrapper>
  );
}
