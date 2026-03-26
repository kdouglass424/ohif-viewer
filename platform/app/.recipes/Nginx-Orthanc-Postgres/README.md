# Nginx + Orthanc + Postgres (Development)

A lightweight Docker Compose stack that provides a local Orthanc PACS server backed by PostgreSQL, fronted by an Nginx reverse proxy. Designed for **host-based development** — you run `yarn dev` on your machine and access the viewer through the Nginx proxy to avoid CORS issues with Orthanc's DICOMweb API.

You will need the [draw.io extension](https://marketplace.visualstudio.com/items?itemName=hediet.vscode-drawio) to view the architecture [diagram](./architecture.drawio).

## Services

| Service    | Port | Purpose                            |
|------------|------|------------------------------------|
| nginx      | 3001 | Reverse proxy (OHIF + Orthanc)     |
| orthanc    | 8042 | DICOM PACS (HTTP), 4242 (DICOM)    |
| postgres   | 5432 | Orthanc index database             |
| minio      | 9000 | S3-compatible object storage (API) |
| minio      | 9001 | MinIO web console                  |
| minio-init | —    | Creates `dicom-storage` bucket     |

## Prerequisites

- Docker and Docker Compose installed
- Node.js and Yarn (for running OHIF locally)

## Quick Start

Start the backend stack:

```bash
make docker/up
```

## Uploading DICOM Images

Navigate to `http://localhost:8042` to access the Orthanc UI directly. Click **Upload** in the sidebar to drag-and-drop DICOM files.

## Stopping

```bash
make docker/down
```

To also remove persisted data (Postgres database and Orthanc storage):

```bash
make docker/down-v
```

## MinIO (S3 Storage)

MinIO provides S3-compatible object storage for DICOM files. On startup, the `minio-init` service automatically creates the `dicom-storage` bucket.

- **Console**: http://localhost:9001 (login: `minioadmin` / `minioadmin`)
- **API endpoint**: http://localhost:9000

## Configuration

- [config/nginx.conf](config/nginx.conf) — Nginx reverse proxy rules
- [config/orthanc.json](config/orthanc.json) — Orthanc server settings
- [config/init-pacs-db.sh](config/init-pacs-db.sh) — Postgres initialization script

The OHIF app config used is `platform/app/public/config/local_orthanc.js`.

See [the deployment docs](../../../docs/docs/deployment/nginx--image-archive.md) for more information about OHIF deployment recipes.
