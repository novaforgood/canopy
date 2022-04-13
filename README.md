# Mentor Center v3

## Setup dev environment

Install:

- Docker
- Hasura CLI

### Setup Web Client

```
~$ cd web
~$ npm install
~$ npm run build:graphql
~$ npm run dev
```

### Setup Hasura

Run all commands from inside the `/hasura` folder:

```
~$ cd hasura
```

Start local database and Hasura GraphQL server

```
~$ docker-compose up -d
```

Apply metadata and migrations. (Only necessary if you recently pulled changes and need to update your local instance to match the metadata/migrations in the repo.)

```
~$ hasura metadata apply
~$ hasura migrate apply --all-databases
~$ hasura metadata reload
```

Start Hasura console

```
~$ hasura console --endpoint "http://localhost:8080"  --admin-secret "myadminsecretkey" // Connect to local instance
```
