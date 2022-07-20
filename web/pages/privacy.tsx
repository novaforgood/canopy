import { Footer } from "../components/Footer";
import { CustomPage } from "../types";

const PrivacyPage: CustomPage = () => {
  return (
    <div className="flex flex-col h-screen">
      <iframe
        className="h-screen w-full overflow-y-auto"
        src="https://docs.google.com/document/d/e/2PACX-1vR7b0lQUzxSxYfy5_vNKKb3Uy4irYI0Uwf5c5s-kxfp6oqZspC-Em3nO0mJj0rvYqwLcg9MotSZ0j5G/pub?embedded=true"
      ></iframe>
      <Footer />
    </div>
  );
};

PrivacyPage.showFooter = false;

export default PrivacyPage;
