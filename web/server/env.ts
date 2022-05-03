const SERVER_PROCESS_ENV = {
  NEXT_PUBLIC_GRAPHQL_ENDPOINT: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT,
  GRAPHQL_ADMIN_SECRET: process.env.GRAPHQL_ADMIN_SECRET,
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  AWS_REGION: process.env.AWS_REGION,
  AWS_S3_BUCKET: process.env.AWS_S3_BUCKET,
} as const;

type ServerEnvVarKey = keyof typeof SERVER_PROCESS_ENV;

export function requireServerEnv(name: ServerEnvVarKey) {
  const value = SERVER_PROCESS_ENV[name];
  if (!value) {
    throw new Error(`Missing environment variable ${name}`);
  }
  return value;
}
