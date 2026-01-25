# savings-dashboard

Simple savings dashboard. This is loosely based on the [Remix Indie Stack](https://github.com/remix-run/indie-stack).

![Screenshot - Balances](./screenshot-balances.png)

## Requirements

- **Node.js 24.0.0 or higher** (comes with npm 11)

## Development

- Copy the environment file and adjust it:

```sh
cp .env.example .env
```

- Initial setup:

  ```sh
  npm run setup
  ```

  This will:
  - Generate Prisma client
  - Apply all database migrations
  - Seed the database with sample data

- Validate the app has been set up properly (optional):

  ```sh
  npm run validate
  ```

- Start dev server:

  ```sh
  npm run dev
  ```

This starts your app in development mode, rebuilding assets on file changes.

The database seed script creates a new user with some data you can use to get started:

- Email: `rachel@remix.run`
- Password: `rachelrox`

### Database Migrations

This project uses Prisma Migrate for database schema management.

- Apply pending migrations: `npm run dev:migrate`
- Reset database (WARNING: deletes all data): `npm run dev:reset`
- Create a new migration after schema changes: `npx prisma migrate dev --name <migration_name>`

Migrations are automatically applied on production startup.

## Running with Docker

This project includes Docker support for both development and production environments.

### Development with Docker Compose

To run the PostgreSQL database in Docker for local development:

```sh
docker compose -f docker-compose.dev.yml up -d
```

This starts a PostgreSQL 18 container on port `5434`. Update your `.env` file with:

```
DATABASE_URL="postgresql://savings_dashboard:savings_dashboard_password@localhost:5434/savings_dashboard_dev"
```

Then run the application locally with `npm run dev` as usual.

To stop the database:

```sh
docker compose -f docker-compose.dev.yml down
```

### Production Docker Build

To build and run the application in production mode:

1. Build the Docker image:

   ```sh
   docker build -t savings-dashboard .
   ```

2. Run the container:

   ```sh
   docker run -p 3000:3000 \
     -e DATABASE_URL="your_database_url" \
     -e SESSION_SECRET="your_session_secret" \
     savings-dashboard
   ```

   Make sure to provide:
   - `DATABASE_URL`: Connection string to your PostgreSQL database
   - `SESSION_SECRET`: A secure random string (minimum 32 characters)

The application will be available at `http://localhost:3000`.

### E2E Testing with Docker

To run end-to-end tests with a containerized test database:

```sh
docker compose -f docker-compose.e2e.yml up -d
```

This starts a PostgreSQL test database on port `5433`. The E2E tests are configured to use this database.

## Testing

### Vitest

For lower level tests of utilities and individual components, we use `vitest`. We have DOM-specific assertion helpers via [`@testing-library/jest-dom`](https://testing-library.com/jest-dom).

### Type Checking

This project uses TypeScript. It's recommended to get TypeScript set up for your editor to get a really great in-editor experience with type checking and auto-complete. To run type checking across the whole project, run `npm run typecheck`.

### Linting

This project uses ESLint for linting. That is configured in `.eslintrc.js`.

### Formatting

We use [Prettier](https://prettier.io/) for auto-formatting in this project. It's recommended to install an editor plugin (like the [VSCode Prettier plugin](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)) to get auto-formatting on save. There's also a `npm run format` script you can run to format all files in the project.
