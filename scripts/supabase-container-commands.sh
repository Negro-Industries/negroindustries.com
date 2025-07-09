#!/bin/bash

# Container-friendly Supabase commands
# Use this when Docker is not available in your environment

set -e

# Colors for better output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Supabase Container Commands ===${NC}"

# Function to check if project is linked
check_linked() {
    if [ ! -f "supabase/.temp/project-ref" ]; then
        echo -e "${RED}Error: No linked project found${NC}"
        echo "Run the setup script first: ./scripts/supabase-setup.sh"
        exit 1
    fi
}

# Function to show project status (alternative to 'supabase status')
show_status() {
    echo -e "${YELLOW}Checking project status...${NC}"
    check_linked

    echo -e "${GREEN}Project Information:${NC}"
    supabase projects list --output json | jq -r '.[] | select(.id == "'$(cat supabase/.temp/project-ref)'") | "Name: \(.name)\nStatus: \(.status)\nRegion: \(.region)\nCreated: \(.created_at)"' 2>/dev/null || {
        echo "Project ID: $(cat supabase/.temp/project-ref)"
        echo "Use 'supabase projects list' for full details"
    }

    echo -e "\n${GREEN}Database Connection:${NC}"
    if [ -n "$DATABASE_URL" ]; then
        echo "✅ DATABASE_URL configured"
    else
        echo "❌ DATABASE_URL not set"
    fi

    echo -e "\n${GREEN}Environment Variables:${NC}"
    [ -n "$NEXT_PUBLIC_SUPABASE_URL" ] && echo "✅ NEXT_PUBLIC_SUPABASE_URL" || echo "❌ NEXT_PUBLIC_SUPABASE_URL"
    [ -n "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ] && echo "✅ NEXT_PUBLIC_SUPABASE_ANON_KEY" || echo "❌ NEXT_PUBLIC_SUPABASE_ANON_KEY"
    [ -n "$SUPABASE_SERVICE_ROLE_KEY" ] && echo "✅ SUPABASE_SERVICE_ROLE_KEY" || echo "❌ SUPABASE_SERVICE_ROLE_KEY"
}

# Function to generate TypeScript types
generate_types() {
    echo -e "${YELLOW}Generating TypeScript types...${NC}"
    check_linked

    # Use the project ID from memory
    PROJECT_ID="duuydbxwioydeawzssia"

    echo "Using project ID: $PROJECT_ID"
    npx supabase gen types --project-id "$PROJECT_ID" > types/supabase.ts

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ TypeScript types generated successfully${NC}"
        echo "Types saved to: types/supabase.ts"
    else
        echo -e "${RED}❌ Failed to generate types${NC}"
        exit 1
    fi
}

# Function to list migrations
list_migrations() {
    echo -e "${YELLOW}Listing migrations...${NC}"
    check_linked
    supabase migration list --linked
}

# Function to create new migration
create_migration() {
    if [ -z "$1" ]; then
        echo -e "${RED}Error: Migration name required${NC}"
        echo "Usage: $0 create-migration <migration_name>"
        exit 1
    fi

    echo -e "${YELLOW}Creating new migration: $1${NC}"
    npx supabase migration new "$1"
    echo -e "${GREEN}✅ Migration created${NC}"
}

# Function to push migrations
push_migrations() {
    echo -e "${YELLOW}Pushing migrations to remote database...${NC}"
    check_linked

    echo -e "${RED}⚠️  This will modify your production database!${NC}"
    read -p "Are you sure you want to continue? (y/N): " -n 1 -r
    echo

    if [[ $REPLY =~ ^[Yy]$ ]]; then
        npx supabase migration up --linked
        echo -e "${GREEN}✅ Migrations pushed successfully${NC}"
    else
        echo "Migration push cancelled"
    fi
}

# Main command handler
case "$1" in
    "status"|"")
        show_status
        ;;
    "types")
        generate_types
        ;;
    "migrations")
        list_migrations
        ;;
    "create-migration")
        create_migration "$2"
        ;;
    "push")
        push_migrations
        ;;
    "help")
        echo -e "${GREEN}Available commands:${NC}"
        echo "  $0 status              # Show project status (replaces 'supabase status')"
        echo "  $0 types               # Generate TypeScript types"
        echo "  $0 migrations          # List migrations"
        echo "  $0 create-migration    # Create new migration"
        echo "  $0 push                # Push migrations to remote"
        echo "  $0 help                # Show this help"
        ;;
    *)
        echo -e "${RED}Unknown command: $1${NC}"
        echo "Use '$0 help' to see available commands"
        exit 1
        ;;
esac
