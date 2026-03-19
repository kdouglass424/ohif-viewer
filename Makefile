.PHONY: yarn/init
yarn/init:
	yarn config set workspaces-experimental true
	yarn install --frozen-lockfile

.PHONY: run/dev
run/dev:
	yarn run dev
