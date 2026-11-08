# Product Requirements Document (PRD)

**Project Name**: Campus Lost and Found Portal  
**Document Version**: 1.0.0  
**Phase**: Phase 1 — Planning Documents (Task 1)  
**Status**: Ready for Review  

---

## 1. Executive Summary & Vision

The **Campus Lost and Found Portal** is a web-based community service application designed for college campuses. It provides a centralized, authenticated platform for students, faculty, and administrative staff to report lost or found items, search existing campus records, submit verified ownership claims, and safely reconnect owners with their belongings.

### Core Problems Addressed:
1. **Scattered Communication**: Lost item notices are currently posted across informal WhatsApp groups, physical notice boards, and social media with zero central tracking.
2. **Lack of Privacy**: Openly posting contact numbers and personal information publicly invites spam and harassment.
3. **No Claim Verification**: Informal return processes lack verification mechanisms, allowing fraudulent or mistaken claims.
4. **Lack of Moderation**: No administrative oversight over false reports or outdated listings.

---

## 2. Target Audience & Personas

| Persona | Role | Key Needs & Pain Points |
| :--- | :--- | :--- |
| **The Loser (Owner)** | Student / Staff | Wants to quickly search recent campus listings, report a lost item with distinct identifying details, receive notifications of found items, and review ownership claims. |
| **The Finder** | Student / Staff / Janitorial Staff | Found an item (e.g., student ID, charger, bag) and needs a safe, credible way to post it without publishing personal phone numbers to the entire campus. |
| **Campus Admin** | Security / Faculty / Department Head | Needs visibility into all campus reports, authority to moderate or remove inappropriate listings, and capability to deactivate abusive user accounts. |

---

## 3. Scope of Product (v1 Release)

### 3.1 In-Scope Capabilities
- **Authentication & Authorization**: Registration, login, JWT session handling, role-based access (`user` vs. `admin`), password hashing.
- **Reporting System**: Form submission for lost/found items with category taxonomy, date of incident, specific location, detailed description, and image attachment.
- **Search & Discovery**: Debounced text search (500 ms) matching title, location, and description; filtering by status, category, and report type; client pagination.
- **Claim Workflow**: Authenticated users can submit a claim with hidden proof details; reporters review claims and can approve/reject; approving an item automatically resolves the item and marks competing claims as rejected.
- **Privacy Controls**: Claimant email and phone numbers are strictly concealed until the reporter explicitly approves the ownership claim.
- **Moderation Panel**: Admin-only dashboard to inspect all users and items, toggle user activation status, and remove non-compliant listings.
- **Dual Database Fallback**: Built-in standalone JSON file storage for local/offline operation with MongoDB Atlas support for production.

### 3.2 Out-of-Scope (Deferred to Future Versions)
- Real-time WebSockets / push notifications (email notification integration planned for later phase).
- GPS / map coordinates integration (campus location is text-based).
- Financial rewards or payment processing (platform is strictly a non-commercial utility).

---

## 4. Functional Requirements & Feature Breakdown

### FR-1: Account & Session Management
- **FR-1.1**: User registration requires full name, valid email address, password (minimum 8 characters), and optional phone number.
- **FR-1.2**: Duplicate email registrations must return HTTP 409 Conflict.
- **FR-1.3**: Authentication via email and password returning a signed JWT (7-day validity).
- **FR-1.4**: Invalid credentials must return generic error messages to prevent account enumeration.
- **FR-1.5**: Deactivated accounts must be blocked from logging in or executing authenticated actions.

### FR-2: Lost & Found Item Reporting
- **FR-2.1**: Authenticated users can file a report selecting either `lost` or `found`.
- **FR-2.2**: Mandatory fields: Title (max 100 chars), Category (Electronics, Documents, Accessories, Books, Bags, Keys, Clothing, Other), Location, Date of Event, and Detailed Description (max 1000 chars).
- **FR-2.3**: Optional photo upload supporting formats `.jpg`, `.jpeg`, `.png`, and `.webp` with a strict 2 MB maximum size constraint.
- **FR-2.4**: Newly created items automatically default to `status: "open"`.

### FR-3: Browse, Search & Filter
- **FR-3.1**: Public catalog accessible without login.
- **FR-3.2**: Search box with 500 ms debounce querying across item title, location, and description.
- **FR-3.3**: Faceted filtering by report type (`lost`, `found`) and category.
- **FR-3.4**: Clean empty-state messaging when no matching items exist.
- **FR-3.5**: Paginated responses (12 items per page) with previous/next controls.

### FR-4: Ownership Claim Workflow
- **FR-4.1**: Users cannot submit a claim on an item they reported themselves (HTTP 400 rejection).
- **FR-4.2**: Claimants must provide a clear descriptive message and secret proof details (e.g., student ID number, lock screen wallpaper, distinct scratches).
- **FR-4.3**: Duplicate pending claims from the same user on the same item are blocked (HTTP 409).
- **FR-4.4**: Only the original reporter can approve or reject received claims.
- **FR-4.5**: Approving a claim transitions the item status to `returned` and automatically rejects any competing pending claims.
- **FR-4.6**: Claimant email and phone number are revealed to the reporter **only after** claim approval.

### FR-5: Administration & Moderation
- **FR-5.1**: Dedicated `/admin` route accessible only to users with the `admin` role (non-admins receive HTTP 403).
- **FR-5.2**: Admins can inspect all listings regardless of status and permanently delete any item.
- **FR-5.3**: Admins can deactivate abusive user accounts; admins cannot deactivate their own account or other admin accounts.
- **FR-5.4**: Admins can reactivate previously deactivated accounts.

---

## 5. Non-Functional Requirements (NFRs)

- **NFR-1 (Security)**: Passwords hashed with bcrypt (salt rounds = 10). Rate limiting enforced on all API endpoints (100 req/15 min) and stricter rate limiting on login (5 req/15 min). Helmet security headers and input validation via `express-validator`.
- **NFR-2 (Performance)**: Client bundle size minimized via Vite code-splitting. Server response times < 200 ms for cached/local queries. Search debounced to reduce query volume.
- **NFR-3 (Reliability)**: Zero-dependency local JSON database fallback when MongoDB is unavailable, ensuring high availability during local demo/evaluation.
- **NFR-4 (Accessibility & Usability)**: Mobile responsive down to 375 px width (iPhone SE standard), zero horizontal scrolling, clear error banners, and keyboard-friendly interactive forms.
- **NFR-5 (Data Integrity)**: Cascade updates on claim approval ensuring an item cannot be claimed multiple times simultaneously.

---

## 6. Success Metrics & Acceptance Criteria

1. **Test Coverage**: 100% pass rate across the 20 official test cases in `TESTING.md`.
2. **Zero Insecure Data Leaks**: Claimant personal phone/email never exposed in public API responses or unapproved claim queries.
3. **Responsive Execution**: 0 layout breakage or overflow across mobile (375 px) and desktop displays.
4. **Build & Deploy Readiness**: Production builds compile with 0 warnings/errors, ready for Render/Vercel continuous deployment.

