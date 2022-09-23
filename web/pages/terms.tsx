import { Footer } from "../components/Footer";
import { CustomPage } from "../types";

const TermsPage: CustomPage = () => {
  return (
    <div className="flex h-screen flex-col">
      <iframe
        className="h-screen w-full overflow-y-auto"
        src="https://docs.google.com/document/d/e/2PACX-1vTyI66TNdTp4ERa_SKm0GRXgDJOTH3TUHDgwzwFr-zLC655PolSpmsEiwJ7X0fKViVlqDdslWThyz_e/pub?embedded=true"
      ></iframe>
      <Footer />
    </div>
  );
};

TermsPage.showFooter = false;
TermsPage.requiredAuthorizations = [];

export default TermsPage;
