import { useEffect } from "react";

import { useRouter } from "next/router";

import { useQueryParam } from "../../../hooks/useQueryParam";
import { CustomPage } from "../../../types";

const GoPage: CustomPage = () => {
  const router = useRouter();
  const scheme = useQueryParam("scheme", "string");
  const route = router.query.route;

  useEffect(() => {
    // Redirect from /go/[scheme]/path to /path
    if (scheme && route) {
      router.replace(`/${route}`);
    }
  }, [route, router, scheme]);

  const processedRoute = Array.isArray(route) ? route.join("/") : route;

  return (
    <div className="flex h-screen flex-col items-center justify-center p-4"></div>
  );
};

GoPage.requiredAuthorizations = [];
export default GoPage;
