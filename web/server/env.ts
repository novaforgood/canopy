const SERVER_PROCESS_ENV = {
  NEXT_PUBLIC_GRAPHQL_ENDPOINT: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT,
  GRAPHQL_ADMIN_SECRET: process.env.GRAPHQL_ADMIN_SECRET,
  AWS_ENV_ACCESS_KEY_ID: process.env.AWS_ENV_ACCESS_KEY_ID,
  AWS_ENV_SECRET_ACCESS_KEY: process.env.AWS_ENV_SECRET_ACCESS_KEY,
  AWS_ENV_REGION: process.env.AWS_ENV_REGION,
  AWS_ENV_S3_BUCKET: process.env.AWS_ENV_S3_BUCKET,
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
  DISABLE_EMAILS: process.env.DISABLE_EMAILS ?? "false",
  HOST_URL: process.env.HOST_URL ?? process.env.VERCEL_URL,
  MOBILE_APP_SCHEME: process.env.MOBILE_APP_SCHEME,
  CRON_CLIENT_KEY: process.env.CRON_CLIENT_KEY,
  EMAIL_REPLY_WEBHOOK_KEY: process.env.EMAIL_REPLY_WEBHOOK_KEY,
  EMAIL_REPLY_SUBDOMAIN: process.env.EMAIL_REPLY_SUBDOMAIN,
  EVENT_CLIENT_KEY: process.env.EVENT_CLIENT_KEY,
  EXPO_ACCESS_TOKEN: process.env.EXPO_ACCESS_TOKEN,
} as const;

type ServerEnvVarKey = keyof typeof SERVER_PROCESS_ENV;

export function requireServerEnv(name: ServerEnvVarKey) {
  const value = SERVER_PROCESS_ENV[name];
  if (!value) {
    throw new Error(`Missing environment variable ${name}`);
  }
  return value;
}
