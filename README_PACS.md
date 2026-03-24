# PACS OHIF Viewer

## Prerequisites

- Node.js 18+
- Yarn 1.20+
- Bun
- Docker and Docker Compose

## Getting started

1. Install dependencies:

   ```sh
   make yarn/init
   ```

2. Start the PACS backend stack in the background (nginx, Orthanc, Postgres, MinIO):

   ```sh
   make pacs/up-d
   ```

   Note: to stop the docker compose stack, use:

   ```sh
   # tear down but keep volumes
   make pacs/down
   # tear down and remove volumes
   make pacs/down-v
   ```

3. Run the database migrations:

   ```sh
   make db/migrate
   ```

4. Start the PACS API server:

   ```sh
   make run/server
   ```

5. In a separate terminal, start the OHIF web application:

   ```sh
   make run/dev
   ```

6. Open `http://localhost:3001/worklist` in your browser.

7. Utilize the [workflow.http](./server/test/workflow.http) along with [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) to send sample payloads to the PACS API server.

## Uploading DICOM images

Refer to the [Orthanc README](./platform/app/.recipes/Nginx-Orthanc-Postgres/README.md) to upload DICOM images to the PACS.

## Sync upstream changes

Git commands to sync upstream changes with **OHIF/Viewer**.

```sh
git fetch upstream
git checkout upstream-mirror
git merge upstream/master
git push origin upstream-mirror

git checkout main
git merge upstream-mirror
git push origin main
```
