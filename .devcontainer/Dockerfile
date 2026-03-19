FROM mcr.microsoft.com/devcontainers/javascript-node:1-22-bookworm

# Install Yarn 1.x (Classic)
RUN corepack enable && corepack prepare yarn@1.22.22 --activate

# Install Bun (Nx uses it when bun.lock is present)
USER node
RUN curl -fsSL https://bun.sh/install | bash && $HOME/.bun/bin/bun --version
USER root
ENV BUN_INSTALL=/home/node/.bun
ENV PATH=${BUN_INSTALL}/bin:${PATH}

# Verify versions
RUN node --version && yarn --version
