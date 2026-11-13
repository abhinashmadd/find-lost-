# Architectural Folder Structure Proposal

**Project Name**: Campus Lost and Found Portal  
**Document Version**: 1.0.0  
**Phase**: Phase 2 — Architecture Refactoring (Task 2.3)  
**Status**: Pending User Approval  

---

## 1. Context & Architectural Motivation

Per Engineering Rule **E2** (*Preserve existing architecture, refactor only when justified*) and **E12** (*Never remove files without explicit approval*), this document evaluates the current project layout and proposes a clean, layered, feature-based architecture.

### Current Limitations:
1. **Monolithic Page Components**: `ItemDetails.jsx` (322 lines), `Dashboard.jsx` (312 lines), and `Admin.jsx` (234 lines) bundle API data fetching, form state, and sub-views into monolithic files.
2. **Missing Custom Hooks Layer**: Network calls are triggered directly inside `useEffect` across page components instead of decoupled custom hooks (`useItems`, `useClaims`).
3. **Scattered Validation & Constants**: Validation rules are written inline within route files (`server/routes/*.js`), and system constants (categories, statuses) are repeated as string literals across client and server.

---

## 2. Proposed Refactored Architecture

### 2.1 Frontend Architecture (`client/src/`)

```
client/src/
├── assets/                     # Clean vector SVGs, icons, logos
├── components/                 # Atomic UI primitives
│   ├── common/                 # Alert, Loader, Badge, Pagination, Modal
│   └── layout/                 # Navbar, Footer, ProtectedRoute
├── features/                   # Domain / Feature Slices
│   ├── auth/                   # AuthContext, LoginCard, RegisterCard
│   ├── items/                  # ItemCard, ItemGrid, ItemFilters, ReportForm
│   ├── claims/                 # ClaimForm, ClaimsReceivedList, ClaimsMadeList
│   └── admin/                  # AdminItemsTable, AdminUsersTable
├── hooks/                      # Reusable hooks (useDebounce, useItems, useClaims)
├── pages/                      # Thin route view orchestrators
│   ├── Home.jsx
│   ├── Listing.jsx
│   ├── ItemDetails.jsx
│   ├── ReportItem.jsx
│   ├── Dashboard.jsx
│   ├── Admin.jsx
│   ├── Login.jsx
│   ├── Register.jsx
│   └── NotFound.jsx            # Custom 404 page (Phase 4 requirement)
├── services/                   # Axios client instance & endpoint service functions
│   ├── api.js                  # Base Axios instance with token interceptor
│   ├── itemService.js          # Item API calls
│   └── claimService.js         # Claim API calls
└── index.css                   # Modular CSS with design tokens
```

### 2.2 Backend Architecture (`server/`)

```
server/
├── config/                     # Database connection & localDb engine
│   ├── db.js
│   └── localDb.js
├── constants/                  # Shared system enums (Categories, Roles, ItemStatus)
│   └── index.js
├── controllers/                # Thin request/response handlers
│   ├── adminController.js
│   ├── authController.js
│   ├── claimController.js
│   └── itemController.js
├── middleware/                 # Middleware pipeline
│   ├── auth.js                 # Authentication & authorization checks
│   ├── errorHandler.js         # Centralized error handler
│   ├── rateLimiter.js          # Rate limiters
│   └── upload.js               # Multer upload handler
├── models/                     # Data models (Mongoose + LocalDb Proxy)
│   ├── Claim.js
│   ├── Item.js
│   └── User.js
├── routes/                     # Clean REST route definitions
│   ├── admin.js
│   ├── auth.js
│   ├── claims.js
│   └── items.js
├── validators/                 # Separated express-validator rule chains
│   ├── authValidator.js
│   └── itemValidator.js
├── data/                       # Local JSON database files
├── public/uploads/             # Local upload storage
└── server.js                   # Server initialization
```

---

## 3. Migration & Backward Compatibility Strategy

- **Zero Breaking Changes**: File paths in `pages/` remain identical so existing React Router definitions in `App.jsx` remain 100% functional.
- **Incremental Extraction**: Existing monolithic components will be decomposed step-by-step in Task 2.4 and Task 2.7.
- **Zero File Deletion**: No files will be deleted without explicit confirmation.

