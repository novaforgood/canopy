import { faker } from "@faker-js/faker";
import { LexRuntime } from "aws-sdk";
import { useRouter } from "next/router";

import { Button, Select, Text } from "../../../../components/atomic";
import { Breadcrumbs } from "../../../../components/Breadcrumbs";
import { ProfileSocialsDisplay } from "../../../../components/edit-socials-info/ProfileSocialsDisplay";
import { HtmlDisplay } from "../../../../components/HtmlDisplay";
import { Navbar } from "../../../../components/Navbar";
import { ProfileImage } from "../../../../components/ProfileImage";
import { SidePadding } from "../../../../components/SidePadding";
import { SpaceLandingPage } from "../../../../components/space-homepage/SpaceLandingPage";
import { useProfileByIdQuery } from "../../../../generated/graphql";
import { useCurrentProfile } from "../../../../hooks/useCurrentProfile";
import { useCurrentSpace } from "../../../../hooks/useCurrentSpace";

export default function SpaceHomepage() {
  const router = useRouter();

  const { currentSpace } = useCurrentSpace();

  const profileId = router.query.profileId as string;
  const [{ data: profileData }] = useProfileByIdQuery({
    variables: { profile_id: profileId ?? "" },
  });

  if (!currentSpace) {
    return <div>404 - Space not found</div>;
  }

  if (!profileData?.profile_by_pk?.profile_listing) {
    return <div>404 - Profile listing not found</div>;
  }

  const listing = profileData.profile_by_pk.profile_listing;
  const { first_name, last_name, email } = profileData.profile_by_pk.user;

  return (
    <div>
      <SidePadding>
        <Navbar />
        <div className="h-16"></div>
        <Breadcrumbs />
        <div className="h-8"></div>

        <div className="border border-black rounded-lg w-full flex flex-col pb-12">
          <div className="h-20 bg-gray-100 rounded-t-lg"></div>
          <div className="px-20 -mt-8">
            <div className="flex items-center gap-12">
              <ProfileImage
                src={listing.profile_listing_image?.image.url}
                alt={`${first_name} ${last_name}`}
                className="h-48 w-48"
              />
              <div className="flex flex-col mt-4">
                <Text variant="heading3">
                  {first_name} {last_name}
                </Text>
                <div className="h-1"></div>
                <Text variant="body1">
                  Hello! This is my profile summary or bio.
                </Text>
              </div>
            </div>
            <div className="h-16"></div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-8 p-4">
                {listing.profile_listing_responses.map((response) => {
                  return (
                    <div key={response.id}>
                      <Text variant="heading4">
                        {response.space_listing_question.title}
                      </Text>
                      <div className="h-1"></div>
                      <HtmlDisplay html={response.response_html} />
                    </div>
                  );
                })}
              </div>
              <div>
                <div className="h-24 bg-gray-50 p-4 rounded-md">
                  <Text variant="heading4">Tags go here</Text>
                </div>
                <div className="h-8"></div>
                <div className="bg-gray-50 p-4 rounded-md">
                  <Text variant="heading4">Contact me</Text>
                  <div className="h-4"></div>
                  <Text>Need some help? {"We'll"} introduce you.</Text>
                  <div className="h-4"></div>
                  <Button disabled rounded>
                    Introduce me
                  </Button>
                  <div className="h-8"></div>
                  <ProfileSocialsDisplay
                    profileListingId={listing.id}
                    email={email}
                  />

                  <div className="flex"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="h-32"></div>
      </SidePadding>
    </div>
  );
}
