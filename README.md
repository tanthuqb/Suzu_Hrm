# create-t3-turbo

## Overview

This README provides comprehensive instructions for setting up and using the `create-t3-turbo` monorepo starter. It covers installation, dependency configuration, Supabase backend initialization, database schema definition with Drizzle ORM, deploying Supabase functions, and setting up the development environment. Additionally, it explains how to add new UI components or packages and includes deployment guidelines for Next.js on Vercel. The template leverages Turborepo for managing a monorepo structure and includes shared configurations for ESLint, Prettier, Tailwind, and TypeScript.

## Installation

> **Note**  
> Ensure your system meets the requirements specified in [`package.json#engines`](./package.json#L4) before proceeding.

You can initialize an app using the `create-t3-turbo` starter in two ways:

1. Use this repository as a template:

![use-as-template](https://github.com/t3-oss/create-t3-turbo/assets/51714798/bb6c2e5d-d8b6-416e-aeb3-b3e50e2ca994)

2. Use Turbo's CLI (with PNPM as the package manager):

```bash
npx create-turbo@latest -e https://github.com/t3-oss/create-t3-turbo
```

## About

This starter is ideal for migrating a T3 application into a monorepo. It uses [Turborepo](https://turborepo.org) and includes:

```text
.github
  └─ workflows
      └─ CI with pnpm cache setup
.vscode
  └─ Recommended extensions and settings for VSCode users
apps
  └─ next.js
    ├─ Next.js 15
    ├─ React 19
    ├─ Tailwind CSS
    └─ E2E Typesafe API Server & Client
packages
  ├─ api
  |   └─ tRPC v11 router definition
  ├─ supabase
  |   └─ Authentication using Supabase
  ├─ db
  |   └─ Typesafe db calls using Drizzle & Supabase
  └─ ui
    └─ Start of a UI package for the webapp using shadcn-ui
tooling
  ├─ eslint
  |   └─ Shared, fine-grained ESLint presets
  ├─ prettier
  |   └─ Shared Prettier configuration
  ├─ tailwind
  |   └─ Shared Tailwind configuration
  └─ typescript
    └─ Shared tsconfig you can extend from
```

> Replace `@acme` with your organization or project name using find-and-replace (e.g., `@my-company` or `@project-name`).

## Quick Start

### 1. Setup Dependencies

```bash
# Install dependencies
pnpm i

# Configure environment variables
cp .env.example .env
```

### 2. Initialize Supabase Backend

1. Initialize and link your project:

```bash
supabase init
supabase link --project-ref <YOUR_PROJECT_REF>
```

2. Configure Supabase-managed features (Auth, Policies, Triggers):

- Write SQL migrations in `supabase/migrations/*.sql`.
- Push to Supabase Cloud:

```bash
supabase db push
```

### 3. Define Table Schema with Drizzle

1. Declare tables, enums, and relations in `packages/db/src/schema.ts`.
2. Generate a migration scaffold:

```bash
pnpm with-env drizzle-kit generate --custom --name=init_schema
```

3. Apply migrations:

```bash
pnpm with-env drizzle-kit migrate
```

### 4. Deploy Supabase Function (Disable Google Access)

1. Navigate to the Supabase functions directory:

```bash
cd supabase/functions
```

2. Deploy the function:

```bash
supabase functions deploy google-disable-access
```

3. Verify deployment:

```bash
supabase functions list
```

4. Test the function using `curl` or Postman:

```bash
curl -X POST https://<YOUR_SUPABASE_PROJECT>.functions.supabase.co/google-disable-access \
-H "Authorization: Bearer <YOUR_SUPABASE_ANON_KEY>" \
-d '{}'
```

### 5. Start Development Environment

```bash
pnpm dev
# or
pnpm turbo dev
```

- Run local Postgres and Supabase services:

```bash
supabase start
```

### 6a. Add a New UI Component

Run the `ui-add` script:

```bash
pnpm ui-add
```

### 6b. Add a New Package

Run the package generator:

```bash
pnpm turbo gen init
```

Follow the prompts to configure the new package.

## Deployment

### Next.js on Vercel

Ensure the following environment variables are set:

- Supabase project URL & anon key
- Database URL for Drizzle migrations

> **Note**  
> The Next.js app with tRPC must be deployed to communicate with the server in production.

## References

- [create-t3-app](https://github.com/t3-oss/create-t3-app)
- [Blog post on migrating a T3 app](https://jumr.dev/blog/t3-turbo)
