# Decision Log

This document records every major technical decision, its context, justification, and impact, as required by Engineering Rule E17.

---

### Record of Decisions

#### DEC-001: Unified Full-Stack Deployment on Render
- **Date**: 2026-11-08
- **Context**: The client and server were originally configured to run separately in local development. When deployed to cloud hosting, managing two distinct services introduces cross-origin CORS overhead and multiple hosting configurations.
- **Decision**: Configure Express in `server/server.js` to serve production static assets from `client/dist/` with SPA fallback for client-side routing, while preserving `/api/*` for REST endpoints.
- **Impact**: Enables single-service deployment on Render via `render.yaml` with zero CORS friction in production.

#### DEC-002: Dual-Mode Database Layer (Mongoose + Standalone Local DB)
- **Date**: 2026-10-30
- **Context**: Developers or college examiners may run the application without an active local MongoDB daemon or internet connectivity for Atlas.
- **Decision**: Implemented Proxy wrappers on Mongoose models (`User`, `Item`, `Claim`) that gracefully route queries to local JSON files (`server/data/*.json`) when MongoDB is unreachable.
- **Impact**: Zero-dependency local setup without compromising Mongoose model compatibility in production.

#### DEC-003: Client-Side Service & Hook Abstraction Layer
- **Date**: 2026-11-13
- **Context**: UI components previously invoked axios directly via `api.js` and mixed HTTP query construction, pagination state, and debounce timers with view rendering.
- **Decision**: Introduced a dedicated domain service layer (`authService`, `itemService`, `claimService`, `adminService`) and custom reusable hooks (`useDebounce`, `useItems`).
- **Impact**: UI components are decoupled from REST endpoints, improving testability, modularity, and adherence to rule E4 and Phase 2 architecture refactoring requirements.

#### DEC-004: Centralized Domain Constants & ID Normalization
- **Date**: 2026-11-13
- **Context**: Magic strings for item types, statuses, user roles, and category taxonomies were hardcoded throughout UI views and backend controllers. Additionally, inconsistent serialization between MongoDB `_id` and client `id` resulted in fragile ownership and admin checks across page reloads.
- **Decision**: Centralized domain constants (`ITEM_TYPES`, `ITEM_STATUS`, `CLAIM_STATUS`, `USER_ROLES`, `CATEGORIES`) in dedicated modules on both client and server. Enabled Mongoose virtuals (`toJSON: { virtuals: true }`), normalized auth responses and `AuthContext` state, unified date formatting in `client/src/utils/formatters.js`, and removed dead `client/vercel.json`.
- **Impact**: Guarantees type safety, consistent naming conventions across full stack, prevents identity deserialization bugs, and eliminates duplicate logic.

#### DEC-005: Full-Stack Centralized Error Handling & React Error Boundary
- **Date**: 2026-11-14
- **Context**: Backend controllers duplicated manual try/catch blocks that swallowed internal error details and returned generic 500 status codes without invoking Express's centralized error middleware. On the frontend, unhandled rendering runtime errors resulted in a blank white screen, and expired JWT tokens caused silent repeated 401 failures.
- **Decision**: Created `AppError` operational error class, `asyncHandler` controller wrapper, and comprehensive `errorHandler` middleware that handles Mongoose `CastError`, `ValidationError`, `11000` duplicate key, and JWT errors with environment-aware sanitization. On the client, introduced `ErrorBoundary` component around application routes and an Axios response interceptor for automatic 401 session clearing and human-readable error formatting. Added process-level `unhandledRejection` and `uncaughtException` graceful shutdowns.
- **Impact**: Guarantees zero unhandled exceptions escape uncaught, prevents UI white-screen crashes, protects internal stack traces from leaking to clients in production, and provides actionable telemetry in development.

#### DEC-006: Separation of Configuration from Code via Centralized Modules
- **Date**: 2026-11-15
- **Context**: `process.env` lookups and `import.meta.env` were scattered across 10+ disparate files with hardcoded default fallbacks (e.g. fallback JWT secret, hardcoded rate limit windows, and file upload limits), creating security risks and configuration drift.
- **Decision**: Created `server/config/env.js` and `client/src/config/env.js` as single sources of truth. Validated configuration at process startup, enforced strict production warnings if default secrets are detected, parsed typed configuration values, and comprehensively documented all environment parameters in root, server, and client `.env.example` templates.
- **Impact**: Eliminates scattered environment variables, ensures 12-factor application compliance, and prevents silent insecure defaults in production.

#### DEC-007: Modular UI Component Library & Accessible Modal Architecture
- **Date**: 2026-11-19
- **Context**: UI elements including status badges, destructive action prompts (`window.confirm`), empty list placeholders, and form inputs were implemented inline across views with inconsistent styles, non-accessible browser alerts, and code duplication.
- **Decision**: Modularized reusable presentation components: `Badge` (variant-based status/type indicators), `ConfirmationModal` (accessible dialog with Escape key and backdrop dismissal, eliminating blocking `window.confirm`), `EmptyState` (standardized empty listing/claim placeholders with action buttons), and `FormField` (accessible input wrapper). Exported via a central barrel `client/src/components/index.js` and styled according to Phase 3 brand rules.
- **Impact**: Eliminates duplicated UI markup, improves WCAG accessibility and keyboard navigation, removes blocking browser dialogs, and prepares the frontend for automated end-to-end testing.

#### DEC-008: Global State Management Architecture (Toast, Theme, Enhanced Auth)
- **Date**: 2026-11-20
- **Context**: State management across the client application was fragmented. Feedback messages were stored locally inside individual view states, disappearing on route navigation and requiring duplicate banner markup. Theme preferences lacked persistent global synchronization with the DOM, and authentication state relied on basic user/token state without multi-tab synchronization or standardized profile refreshing.
- **Decision**: Implemented a unified global state architecture using React Context:
  1. `ToastContext`: Global notification dispatcher (`showSuccess`, `showError`, `showInfo`) rendering fixed accessible notifications that persist across route transitions with auto-dismiss timers and accessible SVG icons.
  2. `ThemeContext`: Persistent theme state synchronized with `localStorage` and `document.documentElement`'s `data-theme` attribute, with OS system color-scheme listener support.
  3. `AuthContext`: Enhanced with computed flags (`isAuthenticated`, `isAdmin`), `refreshUser()` profile fetcher, and cross-tab session synchronization via window `storage` events.
  4. Unified barrel export `client/src/context/index.js` and composed top-level providers in `App.jsx`.
- **Impact**: Enables seamless global feedback notifications across route changes, provides synchronized multi-tab session management, establishes theme infrastructure, and centralizes state without introducing heavy external dependencies.


