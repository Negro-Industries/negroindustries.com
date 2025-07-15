# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15.3.3 application with TypeScript, Supabase backend, and Tailwind CSS v4. The application manages AI-generated content, monitors GitHub repositories, and handles webhook integrations.

## Development Commands

### Environment Setup
```bash
# Install dependencies (using Bun)
bun install

# Start Supabase locally (required for development)
supabase start

# Generate TypeScript types from database schema
bun run db:gen-types:local
```

### Development
```bash
# Start development server with Turbopack on port 4000
bun run dev

# Build for production
bun run build

# Start production server
bun run start

# Run linting
bun run lint
```

### Testing
```bash
# Unit tests (Jest)
bun run test                    # Run all tests
bun run test:watch             # Watch mode
bun run test:coverage          # Coverage report
bun run test <path>            # Run specific test file

# E2E tests (Playwright) - requires Supabase running
npx playwright install         # Install browsers (first time)
bun run test:e2e              # Run all E2E tests
bun run test:e2e:ui           # Interactive UI mode
bun run test:e2e:debug        # Debug mode
bun run test:e2e:headed       # Visible browser
npx playwright test tests/e2e/auth.spec.ts  # Run specific test
```

## Architecture Overview

### Port Configuration
- **Next.js**: 4000 (not 3000)
- **Supabase API**: 64321
- **Supabase DB**: 64322
- **Supabase Studio**: 64323

### Key Architectural Patterns

1. **Supabase Client Pattern**: Two separate clients for browser and server
   - Browser: `lib/utils/supabase/client.ts`
   - Server: `lib/utils/supabase/server.ts`

2. **API Routes Structure**: App Router API routes in `app/api/`
   - Content CRUD: `/api/content/[id]`
   - Repository content: `/api/content/repository/[repository]`
   - Webhook handlers: `/api/github-webhook`, `/api/telegram-webhook`

3. **Database Schema**: 
   - `generated_content`: AI-generated content with blog posts, social media content
   - `activity_logs`: Activity tracking from various sources
   - Row Level Security (RLS) enabled on all tables

4. **Testing Strategy**:
   - Unit tests use Jest with React Testing Library
   - E2E tests use Playwright with Supabase integration
   - Test files colocated with source or in `__tests__` directories

5. **UI Architecture**:
   - Shadcn UI components in `components/ui/`
   - Matrix/hacker theme with CRT effects
   - Utility-first CSS with Tailwind v4
   - `cn()` utility for className merging

### Task Management System (Task Master)

The project uses a comprehensive task management system through the `task-master` CLI:

```bash
# Common task management commands
task-master list               # View all tasks with status
task-master next              # Show next task to work on
task-master show <id>         # View specific task details
task-master set-status --id=<id> --status=done  # Mark task complete

# Task breakdown
task-master analyze-complexity --research  # Analyze task complexity
task-master expand --id=<id>              # Break down complex tasks

# When implementation differs from plan
task-master update --from=<id> --prompt="explanation"
```

### Coding Principles

1. **TypeScript**: Strict mode enabled, prefer functional programming patterns
2. **No Classes**: Use functions and hooks, avoid class components
3. **Descriptive Names**: Use auxiliary verbs (isLoading, hasError)
4. **File Structure**: exported component → subcomponents → helpers → types
5. **Follow Existing Patterns**: Check neighboring files for conventions

### Before Committing

Always run these commands before marking tasks complete:
- `bun run lint` - Ensure code follows project standards
- `bun run test` - Verify unit tests pass
- `bun run test:e2e` - Verify E2E tests pass (if UI changes)

### Supabase Local Development

For debugging Supabase issues, use Docker directly:
```bash
docker ps  # Find Supabase container
docker exec -i <container_id> psql -U postgres -c "SELECT * FROM generated_content LIMIT 5;"
```

### Environment Variables

Required for local development:
```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:64321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<generated-by-supabase-start>
```

The Supabase CLI automatically provides these when running `supabase start`.