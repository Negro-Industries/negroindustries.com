# Negro Industries

A Next.js application with Supabase integration for content management and GitHub monitoring.

## Features

- Content management system with Supabase backend
- GitHub repository monitoring and webhook integration
- Telegram webhook support
- Admin dashboard
- Real-time content updates

## Development Setup

### Prerequisites

- [Bun](https://bun.sh/) (latest version)
- [Supabase CLI](https://supabase.com/docs/guides/cli)
- Node.js 18+ (for Playwright)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd negroindustries.com
```

2. Install dependencies:
```bash
bun install
```

3. Set up Supabase locally:
```bash
supabase start
```

4. Generate TypeScript types:
```bash
bun run db:gen-types:local
```

5. Start the development server:
```bash
bun run dev
```

The application will be available at `http://localhost:4000`.

## Testing

### Unit Tests

Run Jest unit tests:
```bash
bun run test
bun run test:watch
bun run test:coverage
```

### E2E Tests

This project uses Playwright for end-to-end testing with Supabase integration.

#### Running E2E Tests Locally

1. Install Playwright browsers:
```bash
npx playwright install
```

2. Start Supabase (if not already running):
```bash
supabase start
```

3. Run the tests:
```bash
bun run test:e2e
```

#### E2E Test Options

- `bun run test:e2e` - Run all tests headlessly
- `bun run test:e2e:ui` - Run with Playwright UI
- `bun run test:e2e:debug` - Run in debug mode
- `bun run test:e2e:headed` - Run with browser visible

#### Test Structure

- `tests/e2e/example.spec.ts` - Basic page load and navigation tests
- `tests/e2e/auth.spec.ts` - Authentication flow tests
- `tests/e2e/api.spec.ts` - API endpoint tests
- `tests/e2e/database.spec.ts` - Database operation tests

### CI/CD

E2E tests run automatically on GitHub Actions for:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

The CI pipeline:
1. Sets up Bun and Node.js
2. Installs dependencies
3. Starts Supabase with custom port configuration (64321-64329)
4. Runs database migrations
5. Generates TypeScript types
6. Builds the application
7. Runs Playwright tests
8. Uploads test reports as artifacts

## Port Configuration

This project uses custom ports to avoid conflicts:

- **Next.js**: `4000` (instead of default 3000)
- **Supabase API**: `64321` (instead of default 54321)
- **Supabase DB**: `64322` (instead of default 54322)
- **Supabase Studio**: `64323` (instead of default 54323)
- **Other Supabase services**: `64324-64329`

## Database

The application uses Supabase with PostgreSQL. Key tables:

- `generated_content` - Stores content from various sources

### Database Commands

- `bun run db:gen-types:local` - Generate TypeScript types from local database

## API Endpoints

- `/api/content` - Content management
- `/api/content/[id]` - Individual content items
- `/api/content/repository/[repository]` - Repository-specific content
- `/api/orgs` - Organization management
- `/api/repos` - Repository management
- `/api/github-webhook` - GitHub webhook handler
- `/api/telegram-webhook` - Telegram webhook handler

## Environment Variables

Create a `.env.local` file with:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

For local development with Supabase CLI, these will be auto-generated.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `bun run test && bun run test:e2e`
5. Submit a pull request

## License

[Your License Here]
