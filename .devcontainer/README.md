## Devcontainer: Getting Started

This repository includes a VS Code Dev Container setup for running the OHIF Viewer in development along with a local Orthanc server. A lightweight nginx proxy is also included for development so the viewer can access Orthanc DICOMweb via the same origin (avoids CORS issues).

### Prerequisites

- **VS Code** with the **Dev Containers** extension installed
- **Docker Desktop** installed
  - Recommended: **8–16 GB RAM** allocated to Docker Desktop

### Start the Dev Container

- Open this repo in VS Code
- Run **“Dev Containers: Reopen in Container”**

VS Code will build/start the devcontainer and its compose services.

### Running the app locally

In the devcontainer terminal, run:

```bash
make yarn/init
```

Then:

```bash
make run/dev
```

### Open the OHIF Viewer app

Your IDE may auto-open `http://localhost:3000`, but for this dev setup you should use **port 3001**:
  - `http://localhost:3001` (nginx dev proxy)

### Useful endpoints

- **OHIF Viewer (via nginx proxy)**: `http://localhost:3001`
- **Orthanc UI / REST / DICOMweb**: `http://localhost:8042`

### Uploading DICOM images to Orthanc

Navigate to `http://localhost:8042` and click the **Upload** button in the side navigation bar.

Simply drag and drop DICOM files into the **Upload** box or select a directory for upload.

### Troubleshooting

- **"Bad Gateway" from nginx**: If you see a 502 Bad Gateway error, try restarting the nginx container in Docker Desktop.
