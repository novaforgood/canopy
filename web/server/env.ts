const SERVER_PROCESS_ENV = {
  NEXT_PUBLIC_GRAPHQL_ENDPOINT: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT,
  GRAPHQL_ADMIN_SECRET: process.env.GRAPHQL_ADMIN_SECRET,
} as const;

type ServerEnvVarKey = keyof typeof SERVER_PROCESS_ENV;

export function requireServerEnv(name: ServerEnvVarKey) {
  const value = SERVER_PROCESS_ENV[name];
  if (!value) {
    throw new Error(`Missing environment variable ${name}`);
  }
  return value;
}
