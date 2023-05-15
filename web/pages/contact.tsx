import Link from "next/link";

import { Button, Text } from "../components/atomic";
import { Footer } from "../components/Footer";
import { SidePadding } from "../components/layout/SidePadding";
import { CustomPage } from "../types";

const PrivacyPage: CustomPage = () => {
  return (
    <div className="flex h-[calc(100dvh)] flex-col">
      <div className="h-[calc(100dvh)] w-full overflow-y-auto">
        <SidePadding>
          <div className="h-16"></div>
          <Text variant="heading3">Contact Us</Text>
          <div className="h-4"></div>
          <Text>
            For any issues or questions related to Canopy, please contact us at{" "}
            <a
              target="_blank"
              className="font-medium hover:underline"
              href="mailto:team@joincanopy.org"
              rel="noreferrer"
            >
              team@joincanopy.org
            </a>
            .
          </Text>
          <div className="h-2"></div>
          <Text>Thank you!</Text>
          <div className="h-8"></div>
          <Link href="/" passHref>
            <Button variant="outline">Back to home</Button>
          </Link>
        </SidePadding>
      </div>
      <Footer />
    </div>
  );
};

PrivacyPage.showFooter = false;
PrivacyPage.requiredAuthorizations = [];

export default PrivacyPage;
