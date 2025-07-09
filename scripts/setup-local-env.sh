#!/bin/bash

# Script to set up local environment variables for Opportunity Radar

echo "Setting up local environment for Opportunity Radar..."

# Check if .env.local already exists
if [ -f ".env.local" ]; then
    echo "⚠️  .env.local already exists. Do you want to overwrite it? (y/N)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        echo "Setup cancelled."
        exit 0
    fi
fi

# Create .env.local from the example
cp config/env.example .env.local

echo "✅ Created .env.local from config/env.example"
echo ""
echo "📝 Next steps:"
echo "1. Edit .env.local and update the following:"
echo "   - Keep NEXT_PUBLIC_SERVER_URL=http://localhost:3000 for local development"
echo "   - Add your Supabase credentials (local or remote)"
echo "   - Add OAuth provider credentials if using social login"
echo ""
echo "2. If using local Supabase:"
echo "   - Run: npx supabase start"
echo "   - Use the local URLs and anon key from the output"
echo ""
echo "3. Start the development server:"
echo "   - Run: bun dev (or npm run dev)"
echo ""
echo "🔒 Remember: Never commit .env.local to git!" 