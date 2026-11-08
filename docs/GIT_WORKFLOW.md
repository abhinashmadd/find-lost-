# Git Version Control & Branching Strategy

**Project Name**: Campus Lost and Found Portal  
**Document Version**: 1.0.0  
**Phase**: Phase 2 — Architecture Refactoring (Task 2.1)  
**Status**: Active Specification  

---

## 1. Branch Topology & Purpose

This repository employs a multi-tier branching strategy to prevent untested code from reaching production:

```
[feature/xxx] ────┐
                  ├──> [staging] ─────────> [main] (Production Live)
[feature/yyy] ────┘        │                   ▲
                           └── QA & Test ──────┤
                                               │
                               [hotfix/zzz] ───┘
```

### Branch Definitions

1. **`main` (Production Branch)**:
   - **Protection Level**: High / Protected.
   - **Deployment Trigger**: Automatically deploys to Render production Web Service (`https://find-lost.onrender.com`).
   - **Policy**: No direct commits allowed. Code must enter `main` only via tested pull requests or fast-forward merges from `staging`. Every commit must pass all automated test cases and compile without error.

2. **`staging` (Pre-Production Integration Branch)**:
   - **Protection Level**: Medium.
   - **Deployment Trigger**: Deploys to the Render staging environment for end-to-end integration testing and user verification.
   - **Policy**: All feature branches and bugfixes merge here first for regression testing.

3. **`feature/<name>` (Development Branches)**:
   - **Protection Level**: Working branch.
   - **Naming Convention**: `feature/<feature-name>` (e.g. `feature/design-system-cleanup`, `feature/dark-mode`).
   - **Policy**: Branch off `staging`, make small reviewable commits (Rule E8), and merge back into `staging` via pull requests.

4. **`hotfix/<name>` (Emergency Production Patches)**:
   - **Protection Level**: Strict.
   - **Policy**: Branched directly from `main` to address critical production issues; merged back into both `main` and `staging`.

---

## 2. Commit Message Standards

Commits adhere to the Conventional Commits specification:

| Prefix | Usage | Example |
| :--- | :--- | :--- |
| `feat:` | New user-facing feature or enhancement | `feat: implement accessible dark mode toggle` |
| `fix:` | Bug fix or error resolution | `fix: prevent duplicate pending claims on items` |
| `refactor:` | Code restructuring without feature addition | `refactor: extract useAuth custom hook` |
| `perf:` | Performance improvements and optimizations | `perf: add compound index on item status and category` |
| `sec:` | Security hardening and access controls | `sec: implement rate limiting on auth endpoints` |
| `docs:` | Documentation updates | `docs: add comprehensive PRD and TRD specifications` |
| `chore:` | Dependency updates, tooling, config changes | `chore: update render.yaml deployment configuration` |

---

## 3. Pull Request & Release Checklist

Before merging any code into `staging` or `main`:
1. `npm run build` passes with 0 errors.
2. The 20 official test cases in `TESTING.md` pass without regression.
3. No `.env` or sensitive credentials staged.
4. Decision Log (`docs/DECISIONS.md`) and Assumptions (`docs/ASSUMPTIONS.md`) updated if technical contracts changed.

