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

2. Start the PACS backend stack in the background (nginx, Orthanc, Postgres):

   ```sh
   make pacs/up-d
   ```

   To stop the docker compose stack, use:

   ```sh
   make pacs/down
   ```

3. In a separate terminal, start the OHIF dev server:

   ```sh
   make run/dev
   ```

4. Open `http://localhost:3001` in your browser.

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
