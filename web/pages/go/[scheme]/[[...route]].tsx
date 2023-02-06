import { useEffect } from "react";

import isMobile from "is-mobile";
import { useRouter } from "next/router";

import { Button, Text } from "../../../components/atomic";
import { CustomPage } from "../../../types";

const mobile = isMobile();

const GoPage: CustomPage = () => {
  const router = useRouter();
  const route = router.query.route;
  const processedRoute = Array.isArray(route) ? route.join("/") : route;

  useEffect(() => {
    if (!mobile && processedRoute) {
      router.push(`/${processedRoute}`);
    }
  }, [processedRoute, router]);

  return (
    <div className="flex h-screen flex-col items-center justify-center p-4">
      <Text className="w-64 text-center">
        Download the Canopy app for a better mobile experience!
      </Text>
      <div className="h-2"></div>
      <a
        className="cursor-pointer"
        href="https://apps.apple.com/us/app/canopy-for-communities/id6444551058"
      >
        <img
          src="https://linkmaker.itunes.apple.com/images/badges/en-us/badge_appstore-lrg.svg"
          alt="app store button"
        />
      </a>
      <div className="h-8"></div>
      <Button
        onClick={() => {
          router.push(`/${processedRoute}`);
        }}
      >
        Continue to Canopy Web App
      </Button>
    </div>
  );
};

GoPage.requiredAuthorizations = [];
export default GoPage;
