import sendgridMail from "@sendgrid/mail";

import { requireServerEnv } from "./env";

const apiKey = requireServerEnv("SENDGRID_API_KEY");
sendgridMail.setApiKey(apiKey);

export { sendgridMail };
