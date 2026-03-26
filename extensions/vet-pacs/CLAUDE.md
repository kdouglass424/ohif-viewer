# Vet PACS — Custom Extension & Mode

This project extends the OHIF Viewer to build a veterinary PACS. All vet-specific code lives outside OHIF core for upstream mergeability.

## Custom Packages

| Package | Location | Purpose |
|---------|----------|---------|
| `@vcr/extension-vet-pacs` | `extensions/vet-pacs/` | Vet patient panel, commands for study status |
| `@vcr/mode-vet-reading` | `modes/vet-reading/` | Reading workflow — extends longitudinal mode, adds vet panel to viewer |
| `@vcr/server` | `server/` | NestJS backend — studies, study list API, Orthanc webhooks |

## Architecture

```
PendingStudies ──→ /reading/orthanc?StudyInstanceUIDs=xxx
                          │
                ┌─────────┴──────────────┐
                │  vet-reading mode      │
                │ (extends longitudinal) |
                ├────────────────────────┤
                │ Left panels:           │
                │   - Thumbnail list     │  (from measurement-tracking)
                │   - Vet Patient panel  │  (from vet-pacs extension)
                │ Center:                │
                │   - Tracked viewport   │  (from measurement-tracking)
                │ Right panels:          │
                │   - Segmentation       │  (from cornerstone)
                │   - Measurements       │  (from measurement-tracking)
                └────────────────────────┘
```

## Study Workflow

1. DICOM uploaded to Orthanc → BullMQ job → study record auto-created (status: `pending`)
2. Hospital doctor views study on PendingStudies screen (`/pending-studies`)
3. Doctor reviews images in viewer, then either:
   - **Mark as Reviewed** → status: `reviewed` (no VCR consultation needed)
   - **Submit to VCR** → status: `submitted` (requests VCR radiology consultation)
4. Both are terminal states that remove the study from the pending queue

## Plugin Registration

Plugins are registered via `platform/app/pluginConfig.json` (NOT by editing `pluginImports.js` directly). The webpack build auto-generates `pluginImports.js` from this config using `platform/app/.webpack/writePluginImportsFile.js`.

To add a new extension or mode:
1. Add entry to `pluginConfig.json`
2. Add dependency to `platform/app/package.json`
3. Add TypeScript path alias to `tsconfig.json`
4. Run `yarn install`

## Server API

The NestJS server runs alongside Orthanc and provides:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/studies` | GET | List studies (paginated, filterable by status; default: pending) |
| `/api/studies/events` | GET (SSE) | Real-time study list updates |
| `/api/studies` | POST | Create study |
| `/api/studies/:id` | GET | Get study by UUID |
| `/api/studies/by-study-instance-uid/:uid` | GET | Get study by StudyInstanceUID (used by VetPatientPanel) |
| `/api/studies/:id/status` | PATCH | Update study status (`pending` → `reviewed` or `submitted`) |

## Study Entity Fields

- **DICOM**: `studyInstanceUid` (unique, required)
- **Patient**: `patientId`, `patientName`, `patientSex`, `patientDob`, `patientWeight`, `species`, `breed`
- **Owner**: `clientName`, `clientId`
- **Workflow**: `status` (pending/reviewed/submitted), `receivedAt`

## Upstream Mergeability

OHIF-maintained files we touch (keep minimal):

| File | What we changed |
|------|-----------------|
| `platform/app/pluginConfig.json` | Added extension + mode entries |
| `platform/app/package.json` | Added `@vcr/*` dependencies |
| `tsconfig.json` | Added `@vcr/*` and `@ohif/mode-*` path aliases |

Everything else (`extensions/vet-pacs/`, `modes/vet-reading/`, `server/`, `PendingStudies`) is our code — no merge conflicts with upstream.

## Adding New Pages

Custom routes are added in `platform/app/src/routes/index.tsx` in the `bakedInRoutes` array. See `PendingStudies` for the pattern:
1. Create component in `platform/app/src/routes/YourPage/`
2. Import and add to `bakedInRoutes` with a path
3. Use `@ohif/ui-next` components for consistent styling

## Adding New Panels to the Viewer

1. Create a component in `extensions/vet-pacs/src/`
2. Register it in `getPanelModule.tsx` with a `name`, `iconName`, `label`, and `component`
3. Reference it in `modes/vet-reading/src/index.ts` as `@vcr/extension-vet-pacs.panelModule.<name>`
4. Add to `leftPanels` or `rightPanels` in the layout
