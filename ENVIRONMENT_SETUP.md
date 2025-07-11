# Environment Setup Guide

This guide walks you through setting up all required API keys and environment variables for the GitHub monitoring system.

## Required Environment Variables

Copy these to your Vercel environment variables:

```bash
# GitHub Configuration
GITHUB_TOKEN=ghp_your_github_personal_access_token_here

# Telegram Bot Configuration  
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHAT_ID=123456789

# Groq AI Configuration (for changelog summaries)
GROQ_API_KEY=gsk_your_groq_api_key_here

# Supabase Configuration (if not already set)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## Step-by-Step Setup

### 1. Telegram Bot Setup

1. **Create Bot**:
   - Message `@BotFather` on Telegram
   - Send `/newbot`
   - Follow prompts to create your bot
   - Save the **Bot Token** as `TELEGRAM_BOT_TOKEN`

2. **Get Chat ID**:
   - Send a message to your bot
   - Visit: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
   - Find `chat.id` in response
   - Save as `TELEGRAM_CHAT_ID`

### 2. GitHub Personal Access Token

1. **Create Token**:
   - Go to: https://github.com/settings/tokens
   - Click "Generate new token (classic)"
   - Name: "GitHub Monitor - [Your Org]"
   - Scopes needed:
     - ✅ `repo` (Full control of repositories)
     - ✅ `admin:org` (Full control of orgs and teams)
     - ✅ `admin:repo_hook` (Repository hooks)

2. **Copy Token**: Save immediately as `GITHUB_TOKEN`

### 3. Groq AI API Key

1. **Get Key**:
   - Visit: https://console.groq.com/
   - Sign up/login
   - Go to API Keys section
   - Create new key
   - Save as `GROQ_API_KEY`

### 4. Vercel Environment Variables

1. **In Vercel Dashboard**:
   - Go to your project
   - Settings → Environment Variables
   - Add all variables above
   - Set for: Production, Preview, Development

### 5. GitHub Webhook Configuration

After deploying to Vercel:

1. **Webhook URL**: `https://your-app.vercel.app/api/github-webhook`

2. **Organization Webhooks**:
   - Go to: `https://github.com/orgs/YOUR_ORG/settings/hooks`
   - Add webhook with URL above
   - Content type: `application/json`
   - Events: "Repositories" and "Pushes"

3. **Repository Webhooks** (alternative):
   - Go to: `https://github.com/YOUR_ORG/YOUR_REPO/settings/hooks`
   - Same configuration as above

## Testing Your Setup

1. **Local Testing**:
   ```bash
   # Set environment variables locally
   export TELEGRAM_BOT_TOKEN=your_token
   export TELEGRAM_CHAT_ID=your_chat_id
   export WEBHOOK_URL=http://localhost:3000/api/github-webhook
   
   # Run test script
   node scripts/test-webhook.js
   ```

2. **Production Testing**:
   - Make a commit to a monitored repository
   - Update CHANGELOG.md
   - Check Telegram for notification

## Troubleshooting

### Common Issues:

1. **Telegram "Forbidden" Error**:
   - Make sure you've sent at least one message to your bot
   - Verify the chat ID is correct

2. **GitHub API "Not Found"**:
   - Check token has correct permissions
   - Verify repository/organization access

3. **Webhook Not Triggering**:
   - Check webhook is active in GitHub settings
   - Verify payload URL is correct
   - Check Vercel function logs

### Debug Commands:

```bash
# Test Telegram bot
curl -X POST "https://api.telegram.org/bot<BOT_TOKEN>/sendMessage" \
  -H "Content-Type: application/json" \
  -d '{"chat_id": "<CHAT_ID>", "text": "Test message"}'

# Test GitHub API access
curl -H "Authorization: token <GITHUB_TOKEN>" \
  https://api.github.com/user

# Check webhook deliveries
# Go to GitHub → Settings → Webhooks → Recent Deliveries
```

## Security Notes

- Never commit API keys to version control
- Use environment variables for all sensitive data
- Regularly rotate GitHub tokens
- Monitor webhook delivery logs for suspicious activity
- Consider using GitHub Apps for production (more secure than personal tokens) 