import { useEffect } from "react";

import { useRouter } from "next/router";

import { useQueryParam } from "../../../hooks/useQueryParam";
import { CustomPage } from "../../../types";

const GoPage: CustomPage = () => {
  const router = useRouter();
  const scheme = useQueryParam("scheme", "string");
  const route = router.query.route;
  const processedRoute = Array.isArray(route) ? route.join("/") : route;

  useEffect(() => {
    // Redirect from /go/[scheme]/path to /path
    if (scheme && processedRoute) {
      router.replace(`/${processedRoute}`);
    }
  }, [processedRoute, router, scheme]);

  return (
    <div className="flex h-screen flex-col items-center justify-center p-4"></div>
  );
};

GoPage.requiredAuthorizations = [];
export default GoPage;
