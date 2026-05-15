# Lucy — Claude Code Guide

Lucy is an AI image generation/mutation tool. Frontend: Vite + React + TypeScript. Backend: Express + ts-node + Redis + Google Gemini. Shared types in `common/`.

## Build commands

```bash
# Common (rebuild first if types change)
cd common && npm run build

# Backend
cd backend && npm run build   # tsc
cd backend && npm start       # ts-node src/server.ts (dev, port 8080)

# Frontend
cd frontend && npm run build  # tsc + vite build
cd frontend && npm run dev    # vite dev server (port 5173, proxies /v1 → :8080)
```

## Frame system — the core UI primitive

There is no React Router. Every window is a **frame** managed by `frontend/src/canvas.ts`.

```typescript
// Open a frame
import { addFrame } from '../canvas'
import MyFrame from './MyFrame'
addFrame(MyFrame, { message: { any: 'data' }, width: 800, height: 600 })

// Open a modal (centered, dark overlay)
addFrame(PromptFrame, { message: { ... }, isModal: true, width: 400, height: 200 })

// Close from inside the frame
import { removeFrame } from '../canvas'
removeFrame(props.frameId)
```

**Every frame component receives `FrameProps`** (`frameId`, `height`, `width`, `x`, `y`, `zIndex`, `isModal`, `message`). The `message` field carries all frame-specific data.

All frame components must wrap their content in `<Frame>` (`frontend/src/Frame.tsx`), which provides the title bar, drag, and resize.

Frame components live in `frontend/src/frames/`. Reusable inner components live in `frontend/src/components/`.

## State management

### Within a WorkbookFrame — WorkbookContext

`WorkbookContext` (`frontend/src/WorkbookContext.tsx`) is the single source of truth for the workbook being edited. Consume it with `useWorkbook()`.

```typescript
const { workbook, setWorkbook, isLoading, setIsLoading, selectedPicFilename, setSelectedPicFilename } = useWorkbook()
```

**Never mutate the workbook object directly.** Always call `setWorkbook({ ...workbook, field: newValue })`.

### Across frames — CustomEvents

Frames communicate via `window` CustomEvents. **Any code that mutates the workbook list (clone, create, delete, rename) must dispatch `workbooks-changed`** so every open `WorkbookListFrame` refreshes.

```typescript
// After mutation
window.dispatchEvent(new CustomEvent('workbooks-changed'))
```

`WorkbookListFrame` listens for this event and calls `loadWorkbooks()`. If you add new list-mutating routes, dispatch this event — do not call `loadWorkbooks()` directly.

## Authentication and fetch

Auth is PKCE → Cognito JWT → `POST /v1/auth/login` → Redis session → `sessionId` http-only cookie.

**Every fetch to `/v1/*` must include `credentials: 'include'`**:

```typescript
await fetch('/v1/workbooks/something', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',           // ← required, always
    body: JSON.stringify({ ... }),
})
```

The backend's `sessionMiddleware` validates the cookie on every `/v1/workbooks/*` request and injects `req.user: UserType` (email + slug).

## Workbook serialization

`WorkbookType` carries `pics: PicType[]` where each `PicType` has an `encodedImage: string` field (base64). **This field is never stored on disk and must be stripped before sending to the backend.**

```typescript
import { stripForBackend } from '../workbookProtocol'
import { hydrateFromBackend } from '../workbookProtocol'

// Before POST
body: JSON.stringify({ workbook: stripForBackend(workbook) })

// After GET
const hydrated = await hydrateFromBackend(workbook)  // fetches images, caches in IndexedDB
```

## Backend route conventions

All `/v1/workbooks/*` routes are protected by `sessionMiddleware`. File I/O helpers are in `backend/src/services/files.ts`:

- `readWorkbook(slug, name)` / `saveWorkbook(slug, name, wb)` — read/write `workbook.json`
- `workbookDir(slug, name)` — path to workbook directory
- `picPath(slug, name, filename)` — path to an image file

`MOUNT_DIR` may start with `~`; it is expanded via `os.homedir()` in `config.ts`. Workbooks live at `MOUNT_DIR/users/<slug>/workbooks/<workbookName>/`.

## Common invariants

| Rule | Detail |
|---|---|
| `credentials: 'include'` | Every `/v1/*` fetch, no exceptions |
| `stripForBackend()` | Before every POST that sends a workbook |
| `hydrateFromBackend()` | After every GET that returns a workbook |
| `workbooks-changed` event | After clone, create, delete, rename |
| `setWorkbook()` | Never mutate the workbook object in-place |
| `removeFrame(frameId)` | Always close frames explicitly; don't hide. Every frame must pass a close `headerButtons` with `ButtonIcons.x` + `removeFrame(props.frameId)` |
| `isModal: true` | For dialogs; don't set x/y on modals |
| "empty" pic | Every workbook has a placeholder pic with `filename: 'empty'` and `mimeType: ''`; never assume `pics.length > 0` means real images exist |
| One focused prompt | Only one `PromptType` has `focused: true`; use `.find(p => p.focused)` |
| Common types | If you change `common/src/types.ts`, rebuild common and reinstall in frontend/backend |
