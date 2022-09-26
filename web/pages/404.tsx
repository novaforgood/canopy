import { PageNotFound } from "../components/error-screens/PageNotFound";
import { CustomPage } from "../types";

const NotFoundPage: CustomPage = () => {
  return <PageNotFound />;
};

NotFoundPage.showFooter = false;
NotFoundPage.requiredAuthorizations = [];

export default NotFoundPage;
