# Vet PACS — Custom Extension & Mode

This project extends the OHIF Viewer to build a veterinary PACS. All vet-specific code lives outside OHIF core for upstream mergeability.

## Custom Packages

| Package | Location | Purpose |
|---------|----------|---------|
| `@vcr/extension-vet-pacs` | `extensions/vet-pacs/` | Vet patient panel, commands for accession status |
| `@vcr/mode-vet-reading` | `modes/vet-reading/` | Reading workflow — extends longitudinal mode, adds vet panel to viewer |
| `@vcr/server` | `server/` | NestJS backend — accessions, worklist API, Orthanc webhooks |

## Architecture

```
PrioritizedWorklist ──→ /reading/orthanc?AccessionNumber=xxx
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
| `/api/worklist` | GET | List accessions (paginated, filterable by status) |
| `/api/worklist/events` | GET (SSE) | Real-time worklist updates |
| `/api/accessions` | POST | Create accession |
| `/api/accessions/:id` | GET | Get accession by UUID |
| `/api/accessions/by-accession-number/:accessionNumber` | GET | Get accession by accession number (used by VetPatientPanel) |
| `/api/accessions/:id/status` | PATCH | Update accession status (`pending` → `in_progress` → `done`) |

## Accession Entity Fields

- **DICOM**: `accessionNumber`, `studyInstanceUid`
- **Patient**: `patientId`, `patientName`, `patientSex`, `patientDob`, `patientWeight`, `species`, `breed`
- **Owner**: `clientName`, `clientId`
- **Workflow**: `status` (pending/in_progress/done), `submittedAt`

## Upstream Mergeability

OHIF-maintained files we touch (keep minimal):

| File | What we changed |
|------|-----------------|
| `platform/app/pluginConfig.json` | Added extension + mode entries |
| `platform/app/package.json` | Added `@vcr/*` dependencies |
| `tsconfig.json` | Added `@vcr/*` and `@ohif/mode-*` path aliases |

Everything else (`extensions/vet-pacs/`, `modes/vet-reading/`, `server/`, `PrioritizedWorklist`) is our code — no merge conflicts with upstream.

## Adding New Pages

Custom routes are added in `platform/app/src/routes/index.tsx` in the `bakedInRoutes` array. See `PrioritizedWorklist` for the pattern:
1. Create component in `platform/app/src/routes/YourPage/`
2. Import and add to `bakedInRoutes` with a path
3. Use `@ohif/ui-next` components for consistent styling

## Adding New Panels to the Viewer

1. Create a component in `extensions/vet-pacs/src/`
2. Register it in `getPanelModule.tsx` with a `name`, `iconName`, `label`, and `component`
3. Reference it in `modes/vet-reading/src/index.ts` as `@vcr/extension-vet-pacs.panelModule.<name>`
4. Add to `leftPanels` or `rightPanels` in the layout
