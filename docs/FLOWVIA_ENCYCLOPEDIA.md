# Flowvia Codebase Encyclopedia

This is an architecture reference for the Flowvia codebase: what each package does, how state flows, and where to find things. It describes the current structure only — for what changed and when, see [CHANGELOG.md](../CHANGELOG.md).

---

## Overview

Flowvia is a pnpm monorepo containing a React component library for drawing isometric network diagrams (`flowvia-lib`), a Progressive Web App that uses this library (`flowvia-app`), and an optional Express backend for server-side diagram storage (`flowvia-backend`). This encyclopedia provides a comprehensive guide to navigating and understanding the codebase structure, making it easy to locate specific functionality and understand the architecture.

## Table of Contents

1. [Monorepo Structure](#monorepo-structure)
2. [Library Architecture (flowvia-lib)](#library-architecture-flowvia-lib)
3. [Application Architecture (flowvia-app)](#application-architecture-flowvia-app)
4. [Backend Architecture (flowvia-backend)](#backend-architecture-flowvia-backend)
5. [State Management](#state-management)
6. [Component Organization](#component-organization)
7. [Configuration System](#configuration-system)
8. [Internationalization (i18n)](#internationalization-i18n)
9. [Key Technologies](#key-technologies)
10. [Build System](#build-system)
11. [Testing Structure](#testing-structure)
12. [Development Workflow](#development-workflow)
13. [Undo/Redo System](#undoredo-system)

## Monorepo Structure

```
Web-Flowvia/
├── packages/
│   ├── flowvia-lib/             # React component library (published as "flowvia" on npm)
│   │   ├── src/                 # Library source code
│   │   │   ├── Isoflow.tsx     # Main component entry
│   │   │   ├── index.tsx       # Development entry
│   │   │   ├── config/         # Configuration
│   │   │   │   ├── hotkeys.ts  # Hotkey profiles
│   │   │   │   ├── panSettings.ts
│   │   │   │   ├── labelSettings.ts
│   │   │   │   └── zoomSettings.ts
│   │   │   ├── components/     # React components
│   │   │   ├── stores/         # State management (Zustand)
│   │   │   ├── hooks/          # Custom React hooks
│   │   │   ├── types/          # TypeScript types
│   │   │   ├── schemas/        # Zod validation
│   │   │   ├── interaction/    # Interaction handling
│   │   │   ├── i18n/           # Library-level translations (one file per locale)
│   │   │   ├── utils/          # Utility functions
│   │   │   ├── assets/         # Static assets
│   │   │   └── styles/         # Styling
│   │   ├── rslib.config.ts     # Rslib (Rspack-based) build configuration
│   │   ├── package.json        # Library dependencies
│   │   └── tsconfig.json       # TypeScript config
│   │
│   ├── flowvia-app/             # Progressive Web App
│   │   ├── src/                 # App source code
│   │   │   ├── index.tsx       # App entry point
│   │   │   ├── App.tsx         # Main app component
│   │   │   ├── components/     # App-specific components
│   │   │   ├── services/       # Services (storage)
│   │   │   ├── i18n.ts         # i18n configuration
│   │   │   ├── serviceWorkerRegistration.ts
│   │   │   └── setupTests.ts
│   │   ├── public/             # Static assets
│   │   │   ├── service-worker.js  # Hand-written cache-first service worker
│   │   │   └── i18n/app/       # App-level translation JSON files, one per locale
│   │   ├── rsbuild.config.ts   # Rsbuild configuration
│   │   ├── package.json        # App dependencies
│   │   └── tsconfig.json       # TypeScript config
│   │
│   └── flowvia-backend/        # Optional backend server
│       ├── server.js           # Express server (filesystem-backed diagram storage)
│       ├── package.json        # Backend dependencies
│       └── .env.example        # Environment config template
│
├── e2e-tests/                    # Python/Selenium end-to-end tests
├── package.json                  # Root workspace configuration
├── pnpm-workspace.yaml           # pnpm workspace definition
├── Dockerfile                    # Multi-stage Docker build (pnpm-based)
├── compose.yml / compose.dev.yml # Docker Compose configs
├── README.md                    # Project documentation
└── CONTRIBUTING.md              # Contributing guidelines
```

## Library Architecture (flowvia-lib)

### Entry Points

- **`packages/flowvia-lib/src/index.tsx`**: Development mode entry with examples
- **`packages/flowvia-lib/src/Isoflow.tsx`**: Main component exported for library usage

### Provider Hierarchy

```typescript
<ModelProvider>       // Core data model
  <SceneProvider>      // Visual state
    <UiStateProvider>  // UI interaction state
      <ThemeProvider>  // MUI theme
        <LocaleProvider> // i18n locale
          <App>
            <Renderer />   // Canvas rendering
            <UiOverlay />  // UI controls
          </App>
        </LocaleProvider>
      </ThemeProvider>
    </UiStateProvider>
  </SceneProvider>
</ModelProvider>
```

(See `packages/flowvia-lib/src/Isoflow.tsx` for the exact nesting — the outer providers wrap the internal `App` component that renders `Renderer` and `UiOverlay`.)

### Data Flow

1. **Model Data** → Items, Views, Icons, Colors
2. **Scene Data** → Connector paths, Connector labels, Text box sizes
3. **UI State** → Zoom, Pan, Selection, Mode, Hotkey profile, Pan settings, Locale

## Backend Architecture (flowvia-backend)

### Overview

The backend package is an optional Express.js server that provides filesystem-backed diagram storage, useful for Docker deployments where diagrams should sync across devices/browsers. It is not required to run Flowvia — the app works fully offline without it (see [Application Architecture](#application-architecture-flowvia-app)).

**Location**: `/packages/flowvia-backend/`

### Key Files

#### Server (`server.js`)
- **Technology**: Express (`^5`) with ES modules
- **Port**: 3001 (configurable via `BACKEND_PORT`)
- **Host**: 0.0.0.0 (configurable via `BACKEND_HOST`)
- **Features**:
  - CORS enabled for cross-origin requests
  - 10MB JSON payload limit for large diagrams
  - Filesystem-based storage under `STORAGE_PATH`
  - Rate limiting (`express-rate-limit`): 200 reads/min, 50 writes/min per client
  - Diagram-ID path validation (`safeDiagramPath`) to prevent path traversal
  - `ENABLE_GIT_BACKUP` env flag exists but the Git backup itself is not yet implemented (the handler currently only logs a placeholder message)

### API Endpoints

#### Storage Status
```
GET /api/storage/status
Response: { enabled: boolean, gitBackup: boolean, version: string }
```

#### List Diagrams
```
GET /api/diagrams
Response: Array<{ id, name, lastModified, size }>
```

#### Get Diagram
```
GET /api/diagrams/:id
Response: Diagram JSON data
```

#### Create Diagram
```
POST /api/diagrams
Body: Diagram JSON data (optional `id`; one is generated if omitted)
Response: { success: boolean, id: string }
```

#### Save/Update Diagram
```
PUT /api/diagrams/:id
Body: Diagram JSON data
Response: { success: boolean, id: string }
```

#### Delete Diagram
```
DELETE /api/diagrams/:id
Response: { success: boolean }
```

All `/api/diagrams*` routes return `503` when `ENABLE_SERVER_STORAGE` is not `true`.

### Configuration

**Environment Variables** (`.env`, loaded via `process.loadEnvFile()`):
- `ENABLE_SERVER_STORAGE`: Enable/disable storage endpoints (default: disabled)
- `STORAGE_PATH`: Directory for diagram files (default: `/data/diagrams`)
- `BACKEND_PORT`: Server port (default: `3001`)
- `BACKEND_HOST`: Server host (default: `0.0.0.0`)
- `ENABLE_GIT_BACKUP`: Reserved for future Git version-control support (default: `false`; no-op today)

### Storage Format

- **Directory**: `/data/diagrams/` (or `STORAGE_PATH`)
- **File Format**: `{diagram-id}.json`
- **Structure**: Full diagram data including icons, nodes, connectors

### Integration with App

**App Service** (`packages/flowvia-app/src/services/storageService.ts`):
- `StorageManager` treats IndexedDB as the local source of truth and the server (when reachable) as a best-effort sync target — every write lands in IndexedDB first and must succeed; server writes/reads are attempted opportunistically and silently fall back to local on failure
- Detects server availability on startup and re-checks periodically (60s cache)
- Handles request timeouts (5–15s depending on operation) and error states

## State Management

### 1. ModelStore (`src/stores/modelStore.tsx`)

**Purpose**: Core business data

**Key Data**:
- `items`: Diagram elements (nodes)
- `views`: Different diagram perspectives
- `icons`: Available icon library
- `colors`: Color palette
- `history`: Undo/redo stack for this store (see [Undo/Redo System](#undoredo-system))

**Location**: `/packages/flowvia-lib/src/stores/modelStore.tsx`
**Types**: `/packages/flowvia-lib/src/types/model.ts`

### 2. SceneStore (`src/stores/sceneStore.tsx`)

**Purpose**: Visual/rendering state

**Key Data**:
- `connectors`: Path and position data
- `connectorLabels`: Flexible, multi-label system (up to 256 labels per connector, positioned anywhere along the path)
- `textBoxes`: Size information
- `history`: Undo/redo stack for this store

**Location**: `/packages/flowvia-lib/src/stores/sceneStore.tsx`
**Types**: `/packages/flowvia-lib/src/types/scene.ts`

### 3. UiStateStore (`src/stores/uiStateStore.tsx`)

**Purpose**: User interface state

**Key Data**:
- `zoom`: Current zoom level
- `scroll`: Viewport position
- `mode`: Interaction mode
- `editorMode`: Edit/readonly state
- `hotkeyProfile`: Selected hotkey scheme (`qwerty`, `smnrct`, or `none`)
- `panSettings`: Pan control configuration
- `connectorInteractionMode`: `'click'` or `'drag'`
- `locale`: Current language

**Location**: `/packages/flowvia-lib/src/stores/uiStateStore.tsx`
**Types**: `/packages/flowvia-lib/src/types/ui.ts`

## Application Architecture (flowvia-app)

### Overview

The Flowvia application is a Progressive Web App built with Rsbuild that provides a complete diagram editor interface using the flowvia-lib library.

### Key Components

#### App Entry (`packages/flowvia-app/src/index.tsx`)
- Initializes the React app
- Registers the service worker for PWA functionality
- Sets up Quill editor styles
- Initializes i18n

#### Main App (`packages/flowvia-app/src/App.tsx`)
- Contains the Isoflow component from flowvia-lib
- Manages auto-save functionality
- Handles import/export operations
- Provides UI for diagram/session management
- Integrates server storage detection and language switching

#### Service Worker
- **Registration**: `packages/flowvia-app/src/serviceWorkerRegistration.ts` — standard CRA-style `register()`/`unregister()`. In production it registers `service-worker.js` directly; on localhost it first validates the script is served correctly before registering, to avoid caching issues during development.
- **Worker script**: `packages/flowvia-app/public/service-worker.js` — a hand-written cache-first worker. On `install` it pre-caches a fixed list of asset paths (derived from the SW's own scope, e.g. `static/css/main.css`, `static/js/bundle.js`, `manifest.json`, favicon/logo files) under a versioned cache name (`flowvia-v2`). On `fetch` it serves from cache when present, otherwise fetches from the network and caches the (basic, 200-status) response for next time. On `activate` it deletes any cache not matching the current cache name.

### App Features

- **Auto-Save**: Diagram changes are auto-saved 5 seconds after the last edit (`packages/flowvia-app/src/App.tsx`), via `storageManager.getStorage().saveDiagram(...)`
- **Persistent Local Storage**: Diagrams are stored in the browser via IndexedDB (`packages/flowvia-app/src/services/storageService.ts`), which survives browser restarts — not sessionStorage, and not lost when the tab closes
- **Import/Export**: JSON file format for diagram sharing
- **PWA Support**: Installable on desktop and mobile
- **Offline Mode**: Full functionality without internet — IndexedDB storage and the cache-first service worker both work without a network connection
- **Server Storage**: Optional persistent backend storage that syncs across devices when the backend is reachable (see [Backend Architecture](#backend-architecture-flowvia-backend))
- **Multi-language**: Many languages supported at both the library and app level (see [Internationalization](#internationalization-i18n))

## Component Organization

The lists below cover the major, stable component groups — the `components/` directories are not enumerated exhaustively; check the directory listing for the full current set.

### Core Components (Library)

#### Renderer (`packages/flowvia-lib/src/components/Renderer/`)
- **Purpose**: Main canvas rendering
- **Key Files**:
  - `Renderer.tsx`: Container component
- **Renders**: All visual layers including connector labels

#### UiOverlay (`src/components/UiOverlay/`)
- **Purpose**: UI controls overlay
- **Key Files**:
  - `UiOverlay.tsx`: Control panel container
- Renders the various hint-tooltip components for the active tool

#### SceneLayer (`src/components/SceneLayer/`)
- **Purpose**: Transformable layer wrapper
- **Uses**: GSAP for animations
- **Key Files**:
  - `SceneLayer.tsx`: Transform container

### Scene Layers (`packages/flowvia-lib/src/components/SceneLayers/`)

#### Nodes (`/Nodes/`)
- **Purpose**: Render diagram nodes/icons
- **Key Files**:
  - `Node/Node.tsx`: Individual node component (with an `IconTypes/` subfolder for icon rendering variants)
  - `Nodes.tsx`: Node collection renderer
- Supports custom imported icons with scaling

#### Connectors (`/Connectors/`)
- **Purpose**: Lines between nodes
- **Key Files**:
  - `Connector.tsx`: Individual connector
  - `Connectors.tsx`: Connector collection
- **Features**:
  - Multiple line types (solid, dashed, dotted)
  - Bidirectional arrows
  - Click/drag creation modes (configurable, see Configuration System)

#### ConnectorLabels (`/ConnectorLabels/`)
**Purpose**: Multiple labels along connector paths

**Key Files**:
- `ConnectorLabel.tsx`: Individual label component
- `ConnectorLabels.tsx`: Label collection renderer

**Features**:
- Up to 256 labels per connector
- Position anywhere along path (0–100%)
- Support for line 1 and line 2 in double connectors
- Backward compatible with legacy (single-label) format

**Related Utilities**:
- `/src/utils/connectorLabels.ts`: Label migration and positioning logic

#### Rectangles (`/Rectangles/`)
- **Purpose**: Background shapes/regions
- **Key Files**:
  - `Rectangle.tsx`: Individual rectangle
  - `Rectangles.tsx`: Rectangle collection

#### TextBoxes (`/TextBoxes/`)
- **Purpose**: Text annotations
- **Key Files**:
  - `TextBox.tsx`: Individual text box
  - `TextBoxes.tsx`: Text box collection

### Selection Tools

#### Lasso (`/Lasso/`)
**Purpose**: Rectangle-based multi-selection

**Features**:
- Drag to create a selection rectangle
- Select multiple nodes/items
- Visual feedback with a dashed border

#### FreehandLasso (`/FreehandLasso/`)
**Purpose**: Freeform multi-selection

**Features**:
- Draw an arbitrary selection shape
- Path-based item selection
- Real-time visual feedback

**Interaction Modes**:
- `/src/interaction/modes/Lasso.ts`: Rectangle lasso mode
- `/src/interaction/modes/FreehandLasso.ts`: Freehand lasso mode

### UI Components (Library)

#### MainMenu (`packages/flowvia-lib/src/components/MainMenu/`)
- **Purpose**: Application menu
- **Features**: Open, Export, Clear; fully i18n-translated

#### ToolMenu (`packages/flowvia-lib/src/components/ToolMenu/`)
- **Purpose**: Drawing tools palette
- **Tools**: Select, Pan, Add Icon, Draw Rectangle, Add Text, Lasso, Freehand Lasso
- Shows hotkey indicators / visual profile badges for the active hotkey scheme

#### ItemControls (`packages/flowvia-lib/src/components/ItemControls/`)
- **Purpose**: Property panels for selected items
- **Subdirectories**:
  - `/NodeControls/`: Node properties, including `QuickIconSelector.tsx` for fast icon swapping
  - `/ConnectorControls/`: Connector properties — multiple labels, line type selection, arrow direction controls
  - `/RectangleControls/`: Rectangle properties
  - `/TextBoxControls/`: Text properties
  - `/IconSelectionControls/`: Icon picker, with an icon-scaling slider and a layout tuned for small screens

#### Settings Components

**HotkeySettings** (`/HotkeySettings/`)
- Three profiles: QWERTY, SMNRCT, None
- Visual hotkey mapping display, per-tool hotkey customization

**ConnectorSettings** (`/ConnectorSettings/`)
- Toggle between click and drag connector-creation modes
- Mode descriptions and usage hints

**PanSettings** (`/PanSettings/`)
- Mouse pan options (middle-click, right-click, Ctrl, Alt, empty area)
- Keyboard pan options (arrows, WASD, IJKL)
- Pan speed adjustment

**LabelSettings** (`/LabelSettings/`) and **ZoomSettings** (`/ZoomSettings/`)
- Configure connector-label and zoom behavior; back the `labelSettings.ts` / `zoomSettings.ts` config modules

**IconPackSettings** (`/IconPackSettings/`)
- Configure which icon pack(s) are active

**SettingsDialog** (`/SettingsDialog/`)
- Hosts the settings panels above in a single dialog

#### Tooltip Components

**ConnectorHintTooltip** (`/ConnectorHintTooltip/`)
- Shows when the connector tool is active; explains click vs. drag creation modes

**ConnectorRerouteTooltip** (`/ConnectorRerouteTooltip/`)
- Shows how to reroute existing connectors via drag waypoints

**ConnectorEmptySpaceTooltip** (`/ConnectorEmptySpaceTooltip/`)
- Appears when creating a connector in empty space

**LassoHintTooltip** (`/LassoHintTooltip/`)
- Shows when a lasso tool is active; explains selection modes

**ImportHintTooltip** (`/ImportHintTooltip/`)
- Guides users on icon import

#### TransformControlsManager (`packages/flowvia-lib/src/components/TransformControlsManager/`)
- **Purpose**: Selection and manipulation handles
- **Key Files**:
  - `TransformAnchor.tsx`: Resize handles
  - `NodeTransformControls.tsx`: Node-specific controls

#### Error Boundaries (`/DOMErrorBoundary/`)
- **Purpose**: Catches React component errors, displays a user-friendly error UI, and prevents full app crashes

### Other Components

- **Grid** (`/Grid/`): Isometric grid overlay
- **Cursor** (`/Cursor/`): Custom cursor display
- **ContextMenu** (`/ContextMenu/`): Right-click menus
- **ZoomControls** (`/ZoomControls/`): Zoom in/out buttons, including zoom-to-pan conversion
- **ColorSelector** (`/ColorSelector/`): Color picker UI
- **ExportImageDialog** (`/ExportImageDialog/`): Export to PNG dialog
- **RichTextEditor** (`/RichTextEditor/`): Rich text editing (backs text boxes / labels)
- **HistoryControls** (`/HistoryControls/`): Undo/redo buttons
- **HelpDialog** (`/HelpDialog/`), **HintStack** (`/HintStack/`), **Loader** (`/Loader/`), **ProjectionToggle** (`/ProjectionToggle/`): supporting UI

## Configuration System

### Overview

The configuration system provides type-safe, centralized settings for hotkeys, pan controls, label behavior, and zoom behavior.

**Location**: `/packages/flowvia-lib/src/config/`

### Hotkey Configuration (`hotkeys.ts`)

**Purpose**: Define keyboard shortcuts for tools

**Types**:
```typescript
type HotkeyProfile = 'qwerty' | 'smnrct' | 'none';
```

**Profiles**:
1. **QWERTY** (Q-W-E-R-T-Y layout):
   - Q: Select, W: Pan, E: Add Item, R: Rectangle, T: Connector, Y: Text, L: Lasso, F: Freehand

2. **SMNRCT** (Default - S-M-N-R-C-T layout):
   - S: Select, M: Pan, N: Add Item, R: Rectangle, C: Connector, T: Text, L: Lasso, F: Freehand

3. **None**: All hotkeys disabled

**Usage**:
- Configurable via Settings → Hotkeys
- Visual indicators in ToolMenu
- Stored in UI state

### Pan Settings (`panSettings.ts`)

**Purpose**: Configure pan/scroll controls

**Settings**:
- **Mouse Options**:
  - `middleClickPan`: Middle mouse button (default: true)
  - `rightClickPan`: Right mouse button
  - `ctrlClickPan`: Ctrl+Click
  - `altClickPan`: Alt+Click
  - `emptyAreaClickPan`: Click empty canvas area (default: true)

- **Keyboard Options**:
  - `arrowKeysPan`: Arrow keys (default: true)
  - `wasdPan`: WASD keys
  - `ijklPan`: IJKL keys
  - `keyboardPanSpeed`: Pan distance (default: 20px)

### Label Settings (`labelSettings.ts`)

**Purpose**: Default behavior for connector labels (e.g. expanded/collapsed state)

### Zoom Settings (`zoomSettings.ts`)

**Purpose**: Zoom behavior configuration

**Settings**:
- Minimum/maximum zoom levels
- Zoom step increments
- Zoom-to-pan conversion

## Internationalization (i18n)

### Overview

Flowvia supports multiple languages using `i18next`/`react-i18next`, with automatic browser-language detection and fallback to English.

### Library i18n (`packages/flowvia-lib/src/i18n/`)

One TypeScript file per locale, aggregated in `index.ts`. Currently includes: `en-US` (default), `zh-CN`, `es-ES`, `pt-BR`, `fr-FR`, `hi-IN`, `bn-BD`, `ru-RU`, `pl-PL`, `id-ID`, `it-IT`, `tr-TR`, `ko-KR`, `ja-JP`.

**Translation Structure** (illustrative):
```typescript
{
  tools: { select: "Select", pan: "Pan", ... },
  contextMenu: { addNode: "Add Node", ... },
  settings: { hotkeys: "Hotkeys", ... },
  tooltips: { connector: "Click mode: ...", ... }
}
```

**Components**:
- `/src/stores/localeStore.tsx`: Locale state management (`LocaleProvider`)
- `/src/components/ChangeLanguage/`: Language switcher (app-level)

### App i18n (`packages/flowvia-app/src/`)

**Configuration**: `i18n.ts`
- Automatic language detection via `i18next-browser-languagedetector`
- Fallback to English
- Loads translation JSON via `i18next-http-backend`

**Translation Files**: `public/i18n/app/{lang}.json`
- App-specific translations (menus, dialogs, alerts, storage-related messages)
- Locales present here currently include (at least): `en-US`, `de-DE`, `es-ES`, `fr-FR`, `hi-IN`, `id-ID`, `it-IT`, `ja-JP`, `ko-KR`, `pl-PL`, `pt-BR`, `ru-RU`, `tr-TR`, `zh-CN`, `bn-BD` — the app-level locale set and the library-level locale set aren't identical (e.g. `de-DE` currently exists only at the app level), so check both directories when adding/removing a language.

## Key Technologies

### Core Framework
- **React** (^19.2): UI framework
- **TypeScript** (^5.9, repo-wide via `tsconfig.base.json`): Type safety
- **Zustand** (^4.5): State management
- **Immer** (^11): Immutable updates

### UI Libraries
- **Material-UI** (@mui/material ^5.18): Component library
- **Emotion** (@emotion/react, @emotion/styled ^11.14): CSS-in-JS styling

### Graphics & Animation
- **Paper.js** (^0.12): Vector graphics
- **GSAP** (^3.15): Animations
- **Pathfinding** (^0.4.18): Connector routing

### Internationalization
- **react-i18next**: Translation framework (library and app pin different major versions — check each package's `package.json`)
- **i18next**: i18n core
- **i18next-browser-languagedetector**: Auto-detect user language
- **i18next-http-backend** (app only): Loads app-level translation JSON at runtime

### Image Export
- **dom-to-image-more** (^3.7): Canvas to image

### Validation & Forms
- **Zod** (^3.25): Schema validation
- **React Hook Form** (^7.73): Form handling

### Build Tools
- **Rslib** (`@rslib/core`, Rspack-based): Library bundler — produces the npm-publishable `dist/` output
- **Rsbuild** (`@rsbuild/core`, also Rspack-based): App bundler/dev server
- **Jest** (^29): Testing framework (unit/integration)
- **Selenium (Python)**: End-to-end tests under `/e2e-tests`

### Backend
- **Express** (^5): Web server
- **CORS** (^2.8): Cross-origin support
- **express-rate-limit** (^8): Per-route rate limiting
- **UUID** (^9): ID generation

Exact version ranges live in each package's `package.json` — treat the numbers above as an approximate current snapshot, not a source of truth.

## Build System

### Monorepo Build Architecture

The project uses **pnpm workspaces** (`pnpm-workspace.yaml`) to manage three packages:
- **flowvia-lib**: Built with Rslib/Rspack, output as a CommonJS/ESM library for npm publishing
- **flowvia-app**: Built with Rsbuild (Rspack-based)
- **flowvia-backend**: Node.js ES modules (no build step)

### Build Configurations

#### Library (Rslib)
- **Config**: `/packages/flowvia-lib/rslib.config.ts`
- **Build script**: `rslib build && tsc --project tsconfig.declaration.json && tsc-alias` — Rslib produces the JS bundle, a separate `tsc` pass emits `.d.ts` declarations, and `tsc-alias` rewrites path aliases in the emitted declarations
- **Externals**: React, React-DOM (peer dependencies, not bundled)

#### Application (Rsbuild)
- **Config**: `/packages/flowvia-app/rsbuild.config.ts`
- **Features**: Hot reload, PWA support (via the hand-written service worker), optimized production builds
- **Output**: Static files in `build/` directory
- Aliases `react`/`react-dom` to this package's own `node_modules` to force a single resolved React instance under pnpm's non-hoisted `node_modules` layout

#### Backend (Node.js)
- **No build step**: Runs directly with Node.js (`"type": "module"` in package.json)

### Root-Level Scripts (`package.json`)

```bash
# Development
pnpm run dev          # Start app development server
pnpm run dev:lib      # Watch mode for library development
pnpm run dev:backend  # Start backend server

# Building
pnpm run build        # Build library, then app
pnpm run build:lib    # Build library only
pnpm run build:app    # Build app only

# Testing & Quality
pnpm run test         # Run tests in all workspaces
pnpm run lint         # Lint all workspaces

# Publishing
pnpm run publish:lib  # Build and publish library to npm

# Docker
pnpm run docker:build # Build Docker image locally
pnpm run docker:run   # Run with Docker Compose (compose.dev.yml)

# Clean
pnpm run clean        # Clean all build artifacts
```

### Docker Build

Multi-stage build (see `Dockerfile`):
1. **Build stage** (`node:24`): installs dependencies with `pnpm install --frozen-lockfile`, then runs `pnpm run build:lib && pnpm run build:app`.
2. **Production stage** (`node:24-alpine` + nginx): copies the backend source, installs its production dependencies, copies the built app into nginx's web root, and starts both nginx and the backend via `docker-entrypoint.sh`. Exposes port 80 (nginx) and 3001 (backend). Ships with `ENABLE_SERVER_STORAGE=true` and a `/data/diagrams` volume for persistence.

## Testing Structure

### Test Files Location
- Library unit/integration tests: `packages/flowvia-lib/src/**/__tests__/`
- App tests: `packages/flowvia-app/src/**/*.test.tsx`
- Test utilities: `packages/flowvia-lib/src/fixtures/`
- End-to-end tests: `/e2e-tests` (Python + Selenium) — covers flows such as node placement, connector creation, diagram import, and multiple undo/redo scenarios (rectangle/text undo, connector undo, multi-node undo)

### Key Test Areas
- `/packages/flowvia-lib/src/schemas/__tests__/`: Schema validation
- `/packages/flowvia-lib/src/stores/reducers/__tests__/`: State logic, including connector reducer tests
- `/packages/flowvia-lib/src/hooks/__tests__/useHistory.test.tsx`: Undo/redo transaction hook
- `/packages/flowvia-lib/src/utils/__tests__/`: Utility functions

### CI/CD Testing
- GitHub Actions workflow builds the monorepo and runs the Jest test suites
- The `/e2e-tests` Selenium suite exercises the app end-to-end, including undo/redo, in a real browser

## Development Workflow

### Monorepo Development Setup

1. **Clone and Install**:
```bash
git clone https://github.com/nyangko/Flowvia
cd Flowvia
pnpm install  # Installs dependencies for all workspaces
```

2. **Development Mode**:
```bash
# First build the library (required for initial setup)
pnpm run build:lib

# Start app development (includes library in dev mode)
pnpm run dev

# Optional: Start backend server in a separate terminal
pnpm run dev:backend
```

3. **Making Library Changes**:
- Edit files in `packages/flowvia-lib/src/`
- The app resolves `flowvia` to the library's dev build, so changes are picked up without a manual republish (run `pnpm run dev:lib` for a watch build)

4. **Making App Changes**:
- Edit files in `packages/flowvia-app/src/`
- Hot reload updates the browser automatically

5. **Making Backend Changes**:
- Edit `packages/flowvia-backend/server.js`
- Restart the server, or use `pnpm run dev:backend` (nodemon) for auto-reload

### Key Development Files

#### 1. Configuration (`packages/flowvia-lib/src/config.ts`)

**Key Constants**:
- `TILE_SIZE`: Base tile dimensions
- `DEFAULT_ZOOM`: Initial zoom level
- `DEFAULT_FONT_SIZE`: Text defaults
- `INITIAL_DATA`: Default model state
- `MAIN_MENU_OPTIONS`: Default main-menu configuration

#### 2. Hooks Directory (`packages/flowvia-lib/src/hooks/`)

**Common Hooks**:
- `useScene.ts`: Merged scene data
- `useModelItem.ts`: Individual item access (returns `ModelItem | null`)
- `useViewItem.ts`: View item access (returns `ViewItem | null`)
- `useConnector.ts`: Connector management (returns `Connector | null`)
- `useRectangle.ts`: Rectangle access (returns `Rectangle | null`)
- `useTextBox.ts`: Text box access (returns `TextBox | null`)
- `useIcon.tsx`: Icon access (returns `Icon | null`)
- `useColor.ts`: Color access (returns `Color | null`)
- `useIsoProjection.ts`: Coordinate conversion
- `useDiagramUtils.ts`: Diagram operations
- `useInitialDataManager.ts`: Loads/merges initial diagram data on mount
- `useHistory.ts`: Undo/redo transaction system (see [Undo/Redo System](#undoredo-system))

**Important**: Item-access hooks return `null` instead of throwing when an item doesn't exist, preventing React unmount errors when a component tries to read a just-deleted item.

#### 3. Interaction System (`packages/flowvia-lib/src/interaction/`)

**Main File**: `useInteractionManager.ts`

**Interaction Modes** (`/modes/`):
- `Cursor.ts`: Selection mode
- `Pan.ts`: Canvas panning
- `PlaceIcon.ts`: Icon placement (places on the nearest unoccupied tile)
- `Connector.ts`: Drawing connections (click and drag creation modes)
- `DragItems.ts`: Moving elements
- `Rectangle/`: Rectangle tools
- `TextBox.ts`: Text editing
- `Lasso.ts`: Rectangle lasso selection
- `FreehandLasso.ts`: Freehand lasso selection

#### 4. Utilities (`packages/flowvia-lib/src/utils/`)

**Key Utilities**:
- `CoordsUtils.ts`: Coordinate calculations
- `SizeUtils.ts`: Size computations
- `renderer.ts`: Rendering helpers
- `model.ts`: Model manipulation
- `pathfinder.ts`: Connector routing
- `connectorLabels.ts`: Label migration and positioning
- `common.ts`: Common helpers, including `getItemById` (null-safe item access)

#### 5. Type System (`packages/flowvia-lib/src/types/`)

**Core Types**:
- `model.ts`: Business data types (includes `ConnectorLabel`)
- `scene.ts`: Visual state types
- `ui.ts`: Interface types (hotkeys, pan, locale state)
- `common.ts`: Shared types
- `interactions.ts`: Interaction types
- `isoflowProps.ts`: Component prop types

#### 6. Schema Validation (`packages/flowvia-lib/src/schemas/`)

**Validation Schemas**:
- `model.ts`: Model validation
- `connector.ts`: Connector validation (includes label-array validation)
- `rectangle.ts`: Rectangle validation
- `textBox.ts`: Text box validation
- `views.ts`: View validation
- `validation.ts`: Shared validation helpers

## Undo/Redo System

### Implementation

The undo/redo system uses a transaction-based approach so multi-step operations (e.g. placing an icon, which touches both model and scene state) undo/redo as a single atomic step rather than leaving the two stores out of sync.

**Key Components**:
- **Dual, synchronized history**: `modelStore` and `sceneStore` each keep their own past/future stack (`history.past`, `history.future`, capped at a max size). A single `undo()`/`redo()` call pops both stacks together.
- **Transaction wrapper** (`useHistory.ts`): `transaction(fn)` snapshots both stores once before running `fn`, so any number of state changes inside `fn` collapse into one history entry instead of one per change.
- **Location**: `/packages/flowvia-lib/src/hooks/useHistory.ts`

**API**:
```typescript
const { undo, redo, canUndo, canRedo, transaction } = useHistory();

// Group multiple operations into a single undo step
transaction(() => {
  // Multiple state changes here
  // All will be undone/redone together
});
```

**Important consideration**: because model and scene keep independent-but-synchronized stacks, any code path that mutates both stores for what should be "one user action" must go through `transaction()` (or otherwise call `saveToHistory()` on both stores at the same point). Skipping this for a cross-store change is the one way to desync the two histories; it is not a currently-open bug, just the invariant the transaction wrapper exists to enforce.

**Test coverage**: `packages/flowvia-lib/src/hooks/__tests__/useHistory.test.tsx` covers the hook directly, and `/e2e-tests` includes real-browser undo/redo scenarios for rectangles/text, connectors, and multi-node operations.

### Error Handling Patterns

**Problem**: Components can try to access deleted items during React unmounting (e.g. right after an undo removes the item a control panel is showing).

**Solution**: Graceful null handling throughout the codebase —
1. `getItemById` (`/src/utils/common.ts`) returns `null` instead of throwing.
2. All item-access hooks in `/src/hooks/` return `null` when the item doesn't exist.
3. Components using these hooks include null checks and early returns.

## Navigation Quick Reference

### Need to modify...

**Icons?** → `/src/components/ItemControls/IconSelectionControls/`
**Custom icon import?** → `/src/components/ItemControls/IconSelectionControls/IconGrid.tsx`
**Node rendering?** → `/src/components/SceneLayers/Nodes/`
**Connector drawing?** → `/src/components/SceneLayers/Connectors/`
**Connector labels?** → `/src/components/SceneLayers/ConnectorLabels/`
**Connector creation mode?** → `/src/interaction/modes/Connector.ts` + `/src/components/ConnectorSettings/`
**Lasso selection?** → `/src/components/Lasso/`, `/src/components/FreehandLasso/`
**Zoom behavior?** → `/src/stores/uiStateStore.tsx` + `/src/components/ZoomControls/`
**Grid display?** → `/src/components/Grid/`
**Export functionality?** → `/src/components/ExportImageDialog/`
**Color picker?** → `/src/components/ColorSelector/`
**Context menus?** → `/src/components/ContextMenu/`
**Keyboard shortcuts?** → `/src/interaction/useInteractionManager.ts` + `/src/config/hotkeys.ts`
**Tool selection?** → `/src/components/ToolMenu/`
**Selection handles?** → `/src/components/TransformControlsManager/`
**Undo/Redo?** → `/src/hooks/useHistory.ts`
**i18n translations?** → `/src/i18n/` (library), `packages/flowvia-app/public/i18n/app/` (app)
**Server storage?** → `/packages/flowvia-backend/server.js`, `packages/flowvia-app/src/services/storageService.ts`
**Pan settings?** → `/src/config/panSettings.ts` + `/src/components/PanSettings/`
**Tooltips?** → Various `/src/components/*Tooltip/` components

### Want to understand...

**How items are positioned?** → `/src/hooks/useIsoProjection.ts`
**How connectors find paths?** → `/src/utils/pathfinder.ts`
**How state updates work?** → `/src/stores/reducers/`
**How validation works?** → `/src/schemas/`
**Available icons?** → `/src/fixtures/icons.ts`
**Default configurations?** → `/src/config.ts` + `/src/config/*`
**How labels are positioned?** → `/src/utils/connectorLabels.ts`
**How transactions work?** → `/src/hooks/useHistory.ts`
**How i18n works?** → `/src/i18n/`, `/src/stores/localeStore.tsx`
**Backend API?** → `/packages/flowvia-backend/server.js`

## Key Files Reference

| Purpose | File Path | Notes |
|---------|-----------|-------|
| Main entry | `/src/Isoflow.tsx` | |
| Configuration | `/src/config.ts` | |
| Hotkey config | `/src/config/hotkeys.ts` | |
| Pan settings | `/src/config/panSettings.ts` | |
| Label settings | `/src/config/labelSettings.ts` | |
| Model types | `/src/types/model.ts` | Includes `ConnectorLabel` |
| UI state types | `/src/types/ui.ts` | Hotkeys, pan, locale |
| Model store | `/src/stores/modelStore.tsx` | With undo/redo |
| Scene store | `/src/stores/sceneStore.tsx` | With connector labels |
| UI store | `/src/stores/uiStateStore.tsx` | |
| Locale store | `/src/stores/localeStore.tsx` | |
| Main renderer | `/src/components/Renderer/Renderer.tsx` | |
| UI overlay | `/src/components/UiOverlay/UiOverlay.tsx` | With tooltips |
| Interaction manager | `/src/interaction/useInteractionManager.ts` | |
| Coordinate utils | `/src/utils/CoordsUtils.ts` | |
| Connector labels util | `/src/utils/connectorLabels.ts` | |
| History/Undo hook | `/src/hooks/useHistory.ts` | |
| Backend server | `/packages/flowvia-backend/server.js` | |
| App storage service | `/packages/flowvia-app/src/services/storageService.ts` | IndexedDB + optional server sync |
| App i18n config | `/packages/flowvia-app/src/i18n.ts` | |
| App translations | `/packages/flowvia-app/public/i18n/app/{lang}.json` | |
| Library translations | `/src/i18n/{lang}.ts` | |

---

**For Contributors**: See [CONTRIBUTING.md](../CONTRIBUTING.md) for contribution guidelines.
