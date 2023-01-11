import { useRouter } from "next/router";

import { useQueryParam } from "../../../hooks/useQueryParam";
import { CustomPage } from "../../../types";

const GoPage: CustomPage = () => {
  const router = useRouter();
  const scheme = useQueryParam("scheme", "string");
  const route = router.query.route;

  const processedRoute = Array.isArray(route) ? route.join("/") : route;

  return (
    <div className="flex h-screen flex-col items-center justify-center p-4">
      <div className="text-center">You landed here. Scheme: {scheme}</div>
      <div className="text-center">Route: {processedRoute}</div>
    </div>
  );
};

GoPage.requiredAuthorizations = [];
export default GoPage;
