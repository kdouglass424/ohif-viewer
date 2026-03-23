#!/bin/sh
set -e

# Create the 'pacs' database if it doesn't already exist.
# This runs automatically on first postgres volume initialization.
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    SELECT 'CREATE DATABASE pacs'
    WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'pacs')\gexec
EOSQL
