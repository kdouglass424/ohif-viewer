# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

CRITICAL: Track all work in beads. Before starting any task, run `bd ready`.
Before ending any session, run `bd sync`. File discovered work with `bd create`.

## Development Commands

```bash
# Install dependencies (preferred - uses frozen lockfile)
yarn install:frozen

# Start development server (default config)
yarn dev

# Start with local Orthanc PACS backend (devcontainer default)
yarn dev:orthanc

# Start with experimental RSBuild (faster HMR)
yarn dev:fast

# Production build
yarn build

# Build all packages as npm libraries
yarn build:package-all

# Clean build artifacts
yarn clean

# Deep clean including node_modules
yarn clean:deep
```

## Testing

```bash
# Run all unit tests with coverage
yarn test:unit

# Run a single test file
yarn jest path/to/test.spec.js

# E2E tests (Playwright, interactive)
yarn test:e2e

# E2E tests (CI mode, headless)
yarn test:e2e:ci

# E2E with visible browser
yarn test:e2e:headed

# Update DICOM test data submodule
yarn test:data
```

Unit tests use Jest with a multi-project config. E2E tests use Playwright; test selectors use `data-cy` attributes.

## Monorepo Structure

Managed by **Yarn Workspaces + Lerna**.

```
platform/         Core framework packages
  app/            @ohif/app — main React PWA
  core/           @ohif/core — business logic, services (no UI deps)
  ui/             @ohif/ui — legacy React component library
  ui-next/        @ohif/ui-next — new component library (shadcn/ui + Radix)
  i18n/           @ohif/i18n — i18next translations
  cli/            @ohif/cli — scaffolding tool for extensions/modes

extensions/       Feature modules (14 total)
  cornerstone/            Primary 2D/3D image rendering (Cornerstone3D)
  cornerstone-dicom-sr/   Structured Report support
  cornerstone-dicom-seg/  Segmentation/labelmap support
  cornerstone-dicom-rt/   Radiotherapy RTSTRUCT support
  cornerstone-dicom-pmap/ Parametric map support
  cornerstone-dynamic-volume/ 4D/dynamic volume rendering
  default/                Common default features
  dicom-microscopy/       Whole slide microscopy
  dicom-pdf/              PDF rendering
  dicom-video/            DICOM video playback
  measurement-tracking/   Annotation measurement tracking
  tmtv/                   Total Metabolic Tumor Volume workflow
  usAnnotation/           Ultrasound annotation

modes/            Workflow compositions (9 total)
  longitudinal/   Multi-study temporal analysis
  segmentation/   Segmentation-focused workflow
  tmtv/           TMTV analysis workflow
  microscopy/     Slide microscopy viewing
  preclinical-4d/ 4D preclinical imaging
  basic/          Base mode (others extend this)
```

## Architecture

### Extension + Mode System

**Extensions** are plain JavaScript objects with an `id`, optional lifecycle hooks, and one or more typed modules. They register capabilities but do not automatically hook into the app — they make functionality *available* for modes to consume.

**Modules an extension can register:**

| Module | Purpose |
|--------|---------|
| `getLayoutTemplateModule` | Controls layout of a route |
| `getDataSourcesModule` | Maps DICOM metadata to OHIF metadata |
| `getSopClassHandlerModule` | Splits study data into DisplaySets |
| `getPanelModule` | Left/right side panels |
| `getViewportModule` | Renders DisplaySets in viewports |
| `getCommandsModule` | Named commands scoped to the extension |
| `getToolbarModule` | Toolbar buttons and components |
| `getContextModule` | Shared state for a workflow |
| `getHangingProtocolModule` | Hanging protocol rules |
| `getUtilityModule` | Utility functions exposed externally |

**Extension lifecycle hooks:**
- `preRegistration` — runs before modules are registered; wire up services and commands
- `onModeEnter` — runs when entering a mode or switching data sources; set up state
- `onModeExit` — runs when leaving a mode; clean up state

**Modes** compose extensions into workflows. A mode specifies:
- `extensionDependencies` — which extensions are required
- `routes` — URL paths, each with a `layoutTemplate` and initialization function
- `layoutTemplate` props — `leftPanels`, `rightPanels`, `viewports` (each referencing extension modules)
- `hangingProtocol` — auto-selected based on scoring
- `sopClassHandlers` — display set creation modules
- `hotkeys` — keyboard shortcuts
- `modeModalities` — filters mode visibility by imaging modality

Modes reference extension modules using the naming schema: `{extensionId}.{moduleType}.{elementName}` (e.g., `myExt.panelModule.AIPanel`).

**ExtensionManager** (in `@ohif/core`) handles registration, lifecycle, and dependency resolution. The app loads extensions and modes defined in `platform/app/pluginImports.js`.

To scaffold a new extension or mode: `yarn run cli create-extension` / `yarn run cli create-mode`.

### App Initialization Sequence

1. Configuration file is loaded (set by `APP_CONFIG` env var)
2. Extensions listed in config are registered with `ExtensionManager`
3. Services are initialized via `ServicesManager`
4. Modes are built into routes; each mode declares its `extensionDependencies`
5. On route entry, `onModeEnter` fires for all registered extensions
6. Layout template renders panels and viewports using module references

### Services Architecture

`@ohif/core` provides framework-agnostic services accessed through `ServicesManager` using a pub/sub pattern. Services must be self-contained and replaceable with any module sharing the same interface.

**Data services:**
- `DicomMetadataStore` — DICOM metadata storage
- `DisplaySetService` — DICOM series → displayable set conversion
- `SegmentationService` — segmentation data management
- `HangingProtocolService` — layout/viewport arrangement rules
- `MeasurementService` — annotation storage and synchronization
- `ToolBarService` — toolbar item registration

**UI services:**
- `ViewportGridService` — grid layout state
- `CineService` — cine/animation playback
- `CustomizationService` — runtime UI customization
- `UIDialogService` — dialog windows
- `UIModalService` — modal windows
- `UINotificationService` — toast notifications
- `UIViewportDialogService` — viewport-specific dialogs

Extensions access services via the `services` object injected into their factory functions and lifecycle hooks.

### UI Libraries

- **`@ohif/ui`** — legacy library; avoid adding new components here
- **`@ohif/ui-next`** — preferred for new components; built on shadcn/ui + Radix UI + Tailwind CSS

### TypeScript Path Aliases

`tsconfig.json` maps all `@ohif/*` package names directly to their `src/` directories, so cross-package imports resolve to source without a build step during development.

### Configuration

The app is configured at runtime via a JS config file (not bundled). The active config is set by the `APP_CONFIG` environment variable (e.g., `config/local_orthanc.js`). Config files live in `platform/app/public/config/`.

## DevContainer / Local Stack

The devcontainer runs via Docker Compose (`.devcontainer/docker-compose.yml`):

| Service  | Port | Purpose                          |
|----------|------|----------------------------------|
| app      | 3000 | OHIF Viewer dev server           |
| nginx    | 3001 | Reverse proxy (OHIF + Orthanc)   |
| orthanc  | 8042 | DICOM PACS (HTTP), 4242 (DICOM)  |
| postgres | 5432 | Orthanc database                 |

Default env: `APP_CONFIG=config/local_orthanc.js`

Upload DICOM files to Orthanc at `http://localhost:8042` (or via the nginx proxy at `http://localhost:3001/pacs`).

## Build System

Primary: **Webpack 5** — config at `platform/app/.webpack/webpack.pwa.js` and `.webpack/webpack.base.js`.

Experimental: **RSBuild** — config at `rsbuild.config.ts`; use `yarn dev:fast` to try it.

Code formatting: Prettier (`printWidth: 100`, Tailwind CSS plugin). Pre-commit hook runs `lint-staged`.
