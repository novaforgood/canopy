<br/><br/>
<p align="center">
	<img src="/web/public/assets/canopyLogo.svg" width="200"/>
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

FIREBASE_SERVICE_ACCOUNT=
GRAPHQL_ADMIN_SECRET=
```

Run the project:

```
cd web
npm install
npm run build:graphql
npm run dev
```

### Setup Hasura

Create a `.env` file in the `/hasura` folder with the following variables:

```
HASURA_GRAPHQL_JWT_SECRET=
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
hasura metadata apply
hasura migrate apply --all-databases
hasura metadata reload
```

Start Hasura console

```
hasura console --endpoint "http://localhost:8080"  --admin-secret "myadminsecretkey" // Connect to local instance
```
