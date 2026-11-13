# Staging Environment Specification & Workflow

**Project Name**: Campus Lost and Found Portal  
**Document Version**: 1.0.0  
**Phase**: Phase 2 — Architecture Refactoring (Task 2.2)  
**Status**: Active  

---

## 1. Staging vs. Production Topology

To ensure no unverified code or breaking changes affect end-users, a dedicated staging environment mirrors production:

| Attribute | Production Environment | Staging Environment |
| :--- | :--- | :--- |
| **Service Name** | `find-lost` | `find-lost-staging` |
| **Source Branch** | `main` | `staging` |
| **Target URL** | `https://find-lost.onrender.com` | `https://find-lost-staging.onrender.com` |
| **Trigger** | Fast-forward merge from `staging` | Direct push or PR merge into `staging` |
| **`NODE_ENV`** | `production` | `staging` |
| **Database** | MongoDB Atlas (`lostandfound_prod`) | Isolated Staging Database / Local JSON test instance |
| **Admin Credential** | `admin@example.com` | `staging-admin@example.com` / `Staging@1234` |
| **Purpose** | Live campus student & staff traffic | Integration tests, QA validation, user acceptance testing |

---

## 2. Blueprint Configuration (`render.yaml`)

Both environments are declaratively managed through [render.yaml](../render.yaml):
- The `find-lost` service tracks the `main` branch with `autoDeploy: true`.
- The `find-lost-staging` service tracks the `staging` branch with `autoDeploy: true`.
- Environment variables (`NODE_ENV`, `ADMIN_EMAIL`, etc.) are partitioned between services.

---

## 3. Promotion Checklist (Staging to Production)

Before merging `staging` into `main`:
1. **Automated Verification**: Run full local test suite (`node test-script` or Jest/Mocha).
2. **Build Cleanliness**: Run `npm run build` locally and verify zero compilation errors.
3. **Staging Smoke Test**: Access `https://find-lost-staging.onrender.com`:
   - Verify `/api/health` returns `200 OK`.
   - Log in with `staging-admin@example.com`.
   - Submit a test report and test claim.
4. **Fast-Forward Merge**:
   ```bash
   git checkout main
   git merge --ff-only staging
   git push origin main
   ```
5. **Production Verification**: Confirm production build succeeds on Render.

