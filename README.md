<br/><br/>

<p align="center">
	<img src="/web/public/assets/canopy_logo.svg" width="200"/>
</p>
<br/>

# Canopy

## Setup dev environment

Install:

- Docker
- Hasura CLI

### Setup Next.js

Create a `.env` file in the `/web` folder with the following variables:

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

NEXT_PUBLIC_GRAPHQL_ENDPOINT=
NEXT_PUBLIC_GRAPHQL_WS_ENDPOINT=


FIREBASE_SERVICE_ACCOUNT=
GRAPHQL_ADMIN_SECRET=
SENDGRID_API_KEY=
CRON_CLIENT_KEY=
HOST_URL=

AWS_ENV_ACCESS_KEY_ID=
AWS_ENV_SECRET_ACCESS_KEY=
AWS_ENV_REGION=
AWS_ENV_S3_BUCKET=
```

Run the project:

```
cd web
npm install
npm run introspect
npm run build:all
npm run dev
```

### Setup Hasura

Create a `.env` file in the `/hasura` folder with the following variables:

```
HASURA_GRAPHQL_JWT_SECRET=

CANOPY_CRON_WEBHOOK_URL=
CANOPY_CRON_CLIENT_KEY=
```

Run all commands from inside the `/hasura` folder:

```
cd hasura
```

Start local database and Hasura GraphQL server

```
docker-compose up -d
```

Apply metadata and migrations. (Only necessary if you recently pulled changes and need to update your local instance to match the metadata/migrations in the repo.)

```
hasura metadata apply --admin-secret "myadminsecretkey"
hasura migrate apply --all-databases --admin-secret "myadminsecretkey"
hasura metadata reload --admin-secret "myadminsecretkey"
```

Start Hasura console

```
hasura console --admin-secret "myadminsecretkey" // Connect to local instance
```
