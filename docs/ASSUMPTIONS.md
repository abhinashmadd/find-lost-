# Assumptions List

This document logs all technical and product assumptions made during the engineering and launch phases, as required by Engineering Rule E18.

---

### Inferred Project Baseline (Rule 6 Confirmation)

| Parameter | Inferred Value | Basis / Evidence |
| :--- | :--- | :--- |
| **Tech Stack** | MERN Stack (React 18, Vite, Node.js, Express 5, MongoDB / localDb fallback) | Existing package configs and source structure in `client/` and `server/`. |
| **Hosting Provider** | Render.com (Unified Full-Stack Web Service) | `render.yaml` configuration and production static routing in `server/server.js`. |
| **Business / Entity Type** | Educational / Campus Community Utility Portal | Academic references in `TESTING.md`, `README.md`, and student authentication workflows. |
| **Target Country / Region** | India (`en-IN` date format, Indian phone number format) | Localized formatting in `client/src/pages/ItemDetails.jsx` (`locale: en-IN`) and `TESTING.md`. |
| **Payments** | None (100% Free Campus Community Service) | No payment processor or subscription logic exists in the codebase. |
| **User Data Collected** | Name, College Email, Phone (optional), Item Details, Photos, Claim Proof Descriptions | Fields in `User`, `Item`, and `Claim` schemas. |

---

### Key Operational Assumptions

1. **Authentication Scope**: Email-based authentication is restricted to campus/user accounts; email verification/OTP is planned for Phase 6 hardening.
2. **Storage Architecture**: Standalone local JSON storage is maintained as an offline/development fallback, while MongoDB Atlas and Cloudinary are preferred for multi-instance cloud deployments.
3. **Data Privacy**: Claimant contact information (phone, email) must remain concealed from the reporter until the claim is approved by the reporter.

