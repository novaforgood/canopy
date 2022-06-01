import { useRouter } from "next/router";

import { TwoThirdsPageLayout } from "../../pages/TwoThirdsPageLayout";
import { Button, Text } from "../atomic";
export function PageNotFound() {
  const router = useRouter();
  return (
    <TwoThirdsPageLayout>
      <div className="h-screen flex flex-col items-start justify-center px-16">
        <Text variant="heading1">Page not found</Text>
        <div className="h-8"></div>
        <Button
          variant="outline"
          onClick={() => {
            router.push("/");
          }}
        >
          Return home
        </Button>
        <div className="h-40"></div>
      </div>
    </TwoThirdsPageLayout>
  );
}
