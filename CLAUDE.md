# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## GraphQL Queries
Edit GraphQL queries in `/shared/graphql/` then run:
```bash
cd shared && ./distribute.sh
```
This copies queries to both web and mobile projects.

## Key Services
- **Hasura**: GraphQL API at `/hasura` (PostgreSQL backend)
- **SendGrid**: Email service at `/web/server/sendgrid.ts`
- **Firebase**: Authentication (configured in `/web/lib/firebase.ts`)
- **AWS S3**: File uploads via `/web/pages/api/services/uploadImage.ts`

## Common Commands
```bash
# Web development
cd web && npm run dev

# Mobile development  
cd mobile && npm run start

# Hasura console
cd hasura && hasura console --admin-secret "myadminsecretkey"

# Regenerate GraphQL types after schema changes
cd web && npm run introspect && npm run build:graphql
cd mobile && npm run introspect && npm run build:graphql
```