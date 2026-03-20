FROM mcr.microsoft.com/devcontainers/javascript-node:1-22-bookworm

# Install Yarn 1.x (Classic)
RUN corepack enable && corepack prepare yarn@1.22.22 --activate

# Install Bun (Nx uses it when bun.lock is present)
USER node
RUN curl -fsSL https://bun.sh/install | bash && $HOME/.bun/bin/bun --version
USER root
ENV BUN_INSTALL=/home/node/.bun
ENV PATH=${BUN_INSTALL}/bin:${PATH}

# Pre-create .claude directory with correct ownership
RUN mkdir -p /home/node/.claude && chown node:node /home/node/.claude

# Install Homebrew for Linux (must not run as root)
USER node
RUN NONINTERACTIVE=1 /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
ENV PATH=/home/linuxbrew/.linuxbrew/bin:${PATH}

# Install beads CLI via brew
RUN brew install beads
USER root

# Verify versions
RUN node --version && yarn --version && bd --version
