# Agent instructions for Savings Dashboard

## Project Overview

This is a savings dashboard application that allows users to track their savings accounts, balances, and financial progress. Users can organize accounts into groups and types for better financial management and visualization.

## Technology Stack

- **Framework**: Astro (SSR via `@astrojs/node`) with React islands for interactive components
- **Frontend**: React with TypeScript
- **Styling**: Tailwind CSS version 4
- **Data Loading**: Astro page frontmatter on the server, passed to React components as props
- **Mutations**: Astro Actions (`astro:actions`)
- **Routing**: Astro file-based routing in `src/pages/` (migrated from React Router v7 / Remix v2)
- **Build Tool**: Vite
- **Testing**: Vitest + React Testing Library as well as E2E testing with Playwright
- **Linting**: ESLint + Prettier
- **Package Manager**: pnpm
- **Database**: Prisma with PostgreSQL
- **Charts**: Recharts for financial data visualization
- **Version Control**: Git
- **Environment Variables**: Node.js native `--env-file` parameter for testing environment
- **Deployment**: Docker image (`Dockerfile`) running the Astro Node standalone server; migrations run on container start via `scripts/migrate-with-baseline.sh`

## Coding Standards

### General Rules

- Use TypeScript for all new files
- Follow functional components with hooks pattern
- Use Tailwind CSS for styling
- Load data in Astro page frontmatter and mutate data through Astro Actions instead of client-side fetching
- Use meaningful variable and function names
- Write self-documenting code with minimal comments
- Prefer composition over inheritance
- Keep functions small and focused (single responsibility)
- Only ever add a comment to the code if it explains an edge case and why the code is there, except for JSDoc or general function/class documentation.
- At the end of each agent run cycle, run the individual validation steps instead of `pnpm run validate`:
  - `pnpm run test -- --run` (unit tests)
  - `pnpm run lint` (ESLint)
  - `pnpm run astro:check` (Astro check)
  - `pnpm run typecheck` (TypeScript check)
  - `pnpm run format` (Prettier formatting)
  - Do NOT run E2E tests (`pnpm run test:e2e`) as they have compatibility issues with ARM hardware
- If you need to run E2E tests manually, always use `pnpm run test:e2e` and not `pnpm run test:e2e:run`.
- **IMPORTANT**: Always use `pnpm run format` for formatting. Never use custom prettier commands or direct `npx prettier` invocations, as the pnpm script is configured to handle file patterns and ignore paths correctly.

### React specific

- Use PascalCase for component names
- Use camelCase for prop names and function names
- Use destructuring for props and state
- Prefer arrow functions for event handlers
- Use custom hooks for reusable logic
- Always provide proper TypeScript types for props

### File Structure

- Components in `/src/components/`
- Pages (routes) in `/src/pages/`
- Layouts in `/src/layouts/`
- Astro Actions in `/src/actions/`
- Middleware in `/src/middleware/`
- Prisma data models in `/src/models/`
- Utilities in `/src/lib/`
- Unit tests next to the file they test (`*.test.ts` / `*.test.tsx`)
- E2E tests in `/e2e/`
- Prisma schema and migrations in `/prisma/`

### Naming Conventions

- Components: `PascalCase.tsx` (e.g., `AccountCard.tsx`)
- Hooks: `use + PascalCase` (e.g., `useAccountData.ts`)
- Utilities: `camelCase.ts` (e.g., `formatCurrency.ts`)
- Types: `PascalCase` interfaces/types (e.g., `Account`, `Balance`)

### Code Quality

- Always handle loading and error states
- Use proper error boundaries
- Implement proper accessibility (ARIA labels, semantic HTML)
- Optimize for performance (React.memo, useMemo, useCallback when needed)
- Write unit tests for all changes. Reuse existing tests where applicable.
- Use consistent import ordering (external libraries first, then internal modules)

## Project-specific Rules

### Financial Data

- Always validate financial data inputs
- Handle missing or incomplete account/balance data gracefully
- Use consistent currency formatting throughout the app
- Ensure proper decimal precision for financial calculations

### User Experience

- Provide visual feedback for all user actions
- Implement proper loading states
- Show meaningful error messages
- Ensure responsive design works on all screen sizes
- Use consistent spacing and typography

### Performance

- Optimize images and assets
- Minimize bundle size
- Use proper memoization techniques

### Environment Variables

- Use Node.js native `--env-file` parameter instead of dotenv packages
- For E2E tests, use `node --env-file=.env.e2e` to load environment variables
- Avoid importing dotenv packages in code - rely on Node.js built-in support

## Documentation Maintenance Rules

### Self-Maintenance

**IMPORTANT**: When making changes to the codebase that affect any information in this Copilot instructions file, you MUST also update this file accordingly. This includes:

- Technology stack changes (adding/removing libraries, frameworks)
- File structure modifications
- New coding standards or rule changes
- Updated naming conventions
- New project-specific requirements

### README Maintenance

**IMPORTANT**: When making changes that make any section of the README.md outdated, you MUST also update the README.md file accordingly. This includes:

- Installation instructions changes
- New features or functionality
- Changed development workflow
- Updated project description or goals

### Documentation Sync

Always ensure that:

- Code comments match actual implementation
- Type definitions reflect current data structures
- Example code in documentation is working and up-to-date
- All breaking changes are documented

## Common Patterns

### Error Handling

```typescript
try {
  const data = await fetchData();
  setShows(data);
} catch (error) {
  setError(error instanceof Error ? error.message : "An error occurred");
} finally {
  setLoading(false);
}
```

### Component Structure

```typescript
interface Props {
  // Define props here
}

export const ComponentName: React.FC<Props> = ({ prop1, prop2 }) => {
  // Hooks at the top
  // Event handlers
  // Render logic

  return (
    // JSX
  );
};
```

## Testing Guidelines

- Test user interactions, not implementation details
- Use descriptive test names
- Test edge cases and error conditions
- Mock external dependencies according to other tests
- Aim for good test coverage but focus on most useful paths
- Use `vi.spyOn` for mocking functions and methods, do not add new `vi.mock` module mocks
- Reuse the existing shared module mocks instead of creating new ones: Prisma via `mockPrisma` from `src/test-setup.ts`, and `astro:actions` via `src/__mocks__/astro-actions.ts` (aliased in `vitest.config.ts`). Control them with `vi.mocked(...)`
- The only other module mocks are `recharts` in `Charts.test.tsx` and `bcryptjs` in `user.server.test.ts`
- Always run "pnpm test" with `--run`, otherwise the tests will run in watch mode and not return

Remember: These instructions should evolve with the project. Keep them updated as the codebase grows and changes.
