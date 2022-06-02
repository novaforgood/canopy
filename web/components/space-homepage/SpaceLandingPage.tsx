import { useElementSize } from "@mantine/hooks";
import { useRouter } from "next/router";

import { useProfileListingsInSpaceQuery } from "../../generated/graphql";
import { useCurrentSpace } from "../../hooks/useCurrentSpace";
import { useUserData } from "../../hooks/useUserData";
import { Text } from "../atomic";
import { ProfileCard } from "../ProfileCard";

import { SearchBar } from "./SearchBar";

function SpaceSplashPage() {
  const { currentSpace } = useCurrentSpace();

  const { ref, width } = useElementSize();

  const desiredHeight = (width * 3) / 4;

  return (
    <div className="flex items-center">
      <div className="flex flex-col flex-1">
        <Text variant="heading1">{currentSpace?.name}</Text>
        <div className="h-10"></div>
        <Text>Lorem ipsum</Text>
      </div>
      <div className="flex-1 self-stretch">
        <div
          ref={ref}
          className="h-full w-full bg-gray-50"
          style={{ height: desiredHeight }}
        ></div>
      </div>
    </div>
  );
}

export function SpaceLandingPage() {
  const { currentSpace } = useCurrentSpace();

  const router = useRouter();

  const [{ data: profileListingData }] = useProfileListingsInSpaceQuery({
    variables: { space_id: currentSpace?.id ?? "" },
  });

  const allProfileListings = profileListingData?.profile_listing ?? [];

  return (
    <div>
      <div className="h-16"></div>
      <SpaceSplashPage />
      <div className="h-16"></div>
      <SearchBar />
      <div className="h-8"></div>
      <div className="grid grid-cols-4 gap-4">
        {allProfileListings.map((listing, idx) => {
          const { first_name, last_name } = listing.profile.user;

          return (
            <ProfileCard
              key={idx}
              onClick={() => {
                router.push(`${router.asPath}/profile/${listing.profile.id}`);
              }}
              name={`${first_name} ${last_name}`}
              imageUrl={listing.profile_listing_image?.image.url}
              subtitle={"Subtitle"}
              descriptionTitle={"Topics"}
              description={"(Tags here)"}
            />
          );
        })}
      </div>
    </div>
  );
}
