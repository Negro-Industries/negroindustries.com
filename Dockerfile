# Dockerfile for Cursor Background Agents - Fixed Version
# Build: 2025-01-27-v3 - Fixed Node.js version for Vercel CLI
FROM oven/bun:1.1.42-debian

# Install system dependencies (including curl FIRST)
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    git \
    ca-certificates \
    gnupg \
    unzip \
    postgresql-client \
    tmux \
    vim \
    zsh \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 20.x (latest LTS)
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs

# Install Supabase CLI (curl is now available)
RUN SUPABASE_VERSION=$(curl -s https://api.github.com/repos/supabase/cli/releases/latest | grep '"tag_name"' | sed -E 's/.*"([^"]+)".*/\1/' | sed 's/v//') \
    && curl -L -o supabase.deb https://github.com/supabase/cli/releases/download/v${SUPABASE_VERSION}/supabase_${SUPABASE_VERSION}_linux_amd64.deb \
    && dpkg -i supabase.deb \
    && rm supabase.deb

# Install global npm packages
RUN npm install -g vercel@latest

# Set working directory
WORKDIR /workspace

# Install bun globally
RUN curl -fsSL https://bun.sh/install | bash && \
    mv /root/.bun/bin/bun /usr/local/bin/bun && \
    chmod +x /usr/local/bin/bun

# Install Oh My Zsh
RUN sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" "" --unattended

# Set zsh as the default shell
RUN chsh -s $(which zsh)

# Configure Oh My Zsh
RUN sed -i 's/ZSH_THEME="robbyrussell"/ZSH_THEME="agnoster"/' /root/.zshrc && \
    sed -i 's/plugins=(git)/plugins=(git node npm bun docker tmux vi-mode history-substring-search)/' /root/.zshrc

# Fetch custom aliases
RUN wget -O /root/.oh-my-zsh/custom/aliases.zsh \
    https://gist.githubusercontent.com/jbwashington/a9569dd6dd192c3c14b3e2247ef55ac0/raw/ffad8ed388b71437a52b52f25edf0aa57036fd6b/aliases.zsh

# Add custom zsh configuration
RUN echo '\n# Custom aliases\n\
    alias ll="ls -la"\n\
    alias gs="git status"\n\
    alias gp="git pull"\n\
    alias gc="git commit"\n\
    alias gco="git checkout"\n\
    alias vim="vim"\n\
    alias vi="vim"\n\
    \n\
    # Bun completion\n\
    [ -s "/root/.bun/_bun" ] && source "/root/.bun/_bun"\n\
    \n\
    # Add bun to PATH\n\
    export BUN_INSTALL="$HOME/.bun"\n\
    export PATH="$BUN_INSTALL/bin:$PATH"\n\
    \n\
    # Node version manager (if needed)\n\
    export NVM_DIR="$HOME/.nvm"\n\
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"\n\
    \n\
    # Supabase CLI completion\n\
    source <(supabase completion zsh)\n\
    ' >> /root/.zshrc

# Fetch dotfiles
RUN wget -O /root/.vimrc https://gist.githubusercontent.com/jbwashington/8e57e5fa92f8201312835eb6c014f79d/raw/f8317e7ec6c88e174a17873536c19d87a47ee710/.vimrc && \
    wget -O /root/.tmux.conf https://gist.githubusercontent.com/jbwashington/8e57e5fa92f8201312835eb6c014f79d/raw/f8317e7ec6c88e174a17873536c19d87a47ee710/.tmux.conf && \
    wget -O /root/.tmux.conf.local https://gist.githubusercontent.com/jbwashington/8e57e5fa92f8201312835eb6c014f79d/raw/f8317e7ec6c88e174a17873536c19d87a47ee710/.tmux.conf.local

# Install tmux plugin manager
RUN git clone https://github.com/tmux-plugins/tpm /root/.tmux/plugins/tpm

# Note: tmux plugins will be installed on first tmux session start

# Create vim directories
RUN mkdir -p /root/.vim/autoload /root/.vim/bundle /root/.vim/colors

# Install vim-plug
RUN curl -fLo /root/.vim/autoload/plug.vim --create-dirs \
    https://raw.githubusercontent.com/junegunn/vim-plug/master/plug.vim

# Download solarized colorscheme
RUN wget -O /root/.vim/colors/solarized.vim \
    https://raw.githubusercontent.com/altercation/vim-colors-solarized/master/colors/solarized.vim

# Environment variables
ENV SUPABASE_ACCESS_TOKEN=""
ENV NEXT_PUBLIC_SUPABASE_URL=""
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=""
ENV SUPABASE_SERVICE_ROLE_KEY=""
ENV DATABASE_URL=""
ENV DIRECT_URL=""

# Default shell
SHELL ["/bin/zsh", "-c"]

# Expose port
EXPOSE 3000

# Default command
CMD ["bun", "run", "dev"] 