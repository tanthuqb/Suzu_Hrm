# Development Commands for HRM

## Build/Lint/Test Commands

- `pnpm build` - Build all packages and applications
- `pnpm dev` - Start development servers (Next.js by default)
- `pnpm dev:next` - Start Next.js development server only
- `pnpm lint` - Run ESLint on all packages
- `pnpm lint:fix` - Run ESLint and automatically fix issues
- `pnpm typecheck` - Type-check all packages
- `pnpm format` - Check code formatting
- `pnpm format:fix` - Fix code formatting issues
- `pnpm db:push` - Push schema changes to database

## Code Style Guidelines

- **Imports**: Use `import type` for type imports, prefer top-level type imports
- **Types**: Strong typing is required, avoid `any`, no non-null assertions (`!`)
- **Environment Variables**: Access via `~/env` import, never use `process.env` directly
- **Formatting**: Follows Prettier configuration in `@acme/prettier-config`
- **Error Handling**: Proper error handling required, avoid swallowing errors
- **Naming**: Use descriptive names, PascalCase for components, camelCase for variables/functions
- **Components**: Follow existing component patterns, check `packages/ui` for examples
- **Auth**: This project uses Supabase for authentication

This repo is based on create-t3-turbo and uses Turborepo with Next.js, tRPC, Tailwind, and TypeScript.
