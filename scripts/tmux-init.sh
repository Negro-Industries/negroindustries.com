#!/bin/bash

# Tmux development environment initialization script
set -e

SESSION_NAME="dev"

# Check if tmux session already exists
if tmux has-session -t $SESSION_NAME 2>/dev/null; then
    echo "Tmux session '$SESSION_NAME' already exists. Attaching..."
    tmux attach-session -t $SESSION_NAME
    exit 0
fi

echo "Creating new tmux session '$SESSION_NAME'..."

# Create a new tmux session with the first window
tmux new-session -d -s $SESSION_NAME -n 'main' -c /workspace

# Split the window into panes
# Create a horizontal split (top/bottom)
tmux split-window -v -t $SESSION_NAME:0 -c /workspace

# Split the top pane vertically (left/right)
tmux split-window -h -t $SESSION_NAME:0.0 -c /workspace

# Now we have:
# Pane 0.0 (top-left): Main development
# Pane 0.1 (top-right): Git/commands
# Pane 0.2 (bottom): Dev server

# Set up the panes
# Top-left pane: Main development area
tmux send-keys -t $SESSION_NAME:0.0 'echo "🚀 Main development pane - edit files here"' C-m
tmux send-keys -t $SESSION_NAME:0.0 'echo "Run: vim <file> to edit"' C-m

# Top-right pane: Git and commands
tmux send-keys -t $SESSION_NAME:0.1 'echo "📝 Git/Commands pane"' C-m
tmux send-keys -t $SESSION_NAME:0.1 'git status' C-m

# Bottom pane: Dev server (using your alias)
tmux send-keys -t $SESSION_NAME:0.2 'echo "🔧 Dev server pane - starting Next.js..."' C-m
tmux send-keys -t $SESSION_NAME:0.2 'bd' C-m

# Create a second window for database/logs
tmux new-window -t $SESSION_NAME:1 -n 'logs' -c /workspace

# Split the logs window
tmux split-window -h -t $SESSION_NAME:1 -c /workspace

# Left pane: Supabase logs/commands
tmux send-keys -t $SESSION_NAME:1.0 'echo "🗄️ Supabase/Database pane"' C-m
tmux send-keys -t $SESSION_NAME:1.0 'supabase status' C-m

# Right pane: General logs
tmux send-keys -t $SESSION_NAME:1.1 'echo "📊 Logs pane"' C-m
tmux send-keys -t $SESSION_NAME:1.1 'tail -f /workspace/logs/*.log 2>/dev/null || echo "No logs yet"' C-m

# Set pane titles (if supported)
tmux select-pane -t $SESSION_NAME:0.0 -T "Development"
tmux select-pane -t $SESSION_NAME:0.1 -T "Git/Commands"
tmux select-pane -t $SESSION_NAME:0.2 -T "Dev Server"
tmux select-pane -t $SESSION_NAME:1.0 -T "Supabase"
tmux select-pane -t $SESSION_NAME:1.1 -T "Logs"

# Focus on the main development pane
tmux select-window -t $SESSION_NAME:0
tmux select-pane -t $SESSION_NAME:0.0

# Set up some tmux options for this session
tmux set-option -t $SESSION_NAME mouse on
tmux set-option -t $SESSION_NAME status-position top

# Display session info
echo "✅ Tmux session '$SESSION_NAME' created with:"
echo "   Window 0 'main':"
echo "     - Top-left: Development pane"
echo "     - Top-right: Git/Commands"
echo "     - Bottom: Dev server (running)"
echo "   Window 1 'logs':"
echo "     - Left: Supabase/Database"
echo "     - Right: Application logs"
echo ""
echo "Attaching to session..."

# Attach to the session
tmux attach-session -t $SESSION_NAME 