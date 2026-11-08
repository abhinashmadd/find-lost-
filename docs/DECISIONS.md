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

