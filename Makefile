.DEFAULT_GOAL := help

## Show this help message
.PHONY: help
help:
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk '\
/^## / { \
	sub(/^## /, "", $$0); \
	comment = comment ? comment "\n" $$0 : $$0; \
	next; \
} \
/^[a-zA-Z0-9\/_-]+:/ { \
	if (comment) { \
		n = split(comment, lines, "\n"); \
		printf "  %-22s %s\n", $$1, lines[1]; \
		for (i = 2; i <= n; i++) { \
			printf "  %-22s %s\n", "", lines[i]; \
		} \
		comment=""; \
	} \
}' $(MAKEFILE_LIST)

## Initialize yarn and install dependencies
.PHONY: yarn/init
yarn/init:
	COREPACK_ENABLE_DOWNLOAD_PROMPT=0 yarn config set workspaces-experimental true
	COREPACK_ENABLE_DOWNLOAD_PROMPT=0 yarn install --frozen-lockfile

## Start OHIF dev server with local Orthanc config
.PHONY: run/dev
run/dev:
	APP_CONFIG=config/local_orthanc.js OHIF_OPEN_URL=http://localhost:3001/worklist yarn dev

## Start the backend dev server
.PHONY: run/server
run/server:
	yarn dev:server

RECIPE_DIR := platform/app/.recipes/Nginx-Orthanc-Postgres

## Start PACS stack (Orthanc + Nginx + Postgres)
.PHONY: pacs/up
pacs/up:
	docker compose -f $(RECIPE_DIR)/docker-compose.yml up

## Start PACS stack in detached mode
.PHONY: pacs/up-d
pacs/up-d:
	docker compose -f $(RECIPE_DIR)/docker-compose.yml up -d

## Stop PACS stack
.PHONY: pacs/down
pacs/down:
	docker compose -f $(RECIPE_DIR)/docker-compose.yml down

## Stop PACS stack and remove volumes
.PHONY: pacs/down-v
pacs/down-v:
	docker compose -f $(RECIPE_DIR)/docker-compose.yml down -v

## Follow PACS stack logs
.PHONY: pacs/logs
pacs/logs:
	docker compose -f $(RECIPE_DIR)/docker-compose.yml logs -f

## Run database migrations
.PHONY: db/migrate
db/migrate:
	yarn --cwd server migration:run
