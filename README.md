# Campus Lost and Found Web Portal

A full-stack MERN (MongoDB, Express, React, Node.js) web application designed for university and college campuses to help students, faculty, and staff report, search, and recover lost and found belongings safely, transparently, and efficiently.

---

## Key Features

- **User Authentication**: Secure user registration and login with bcrypt password hashing, JWT session tokens, and multi-tab state synchronization.
- **Report Items**: Report lost or found belongings with categories, incident dates, detailed descriptions, and photo uploads (local disk or Cloudinary).
- **Search and Filter**: Real-time 500 ms debounced keyword search across titles, descriptions, and locations, with filtering by type (lost/found) and category.
- **Claim Management and Privacy**: Verified claimants can submit ownership claims with proof details. The item reporter can approve or reject claims; claimant contact information is shielded and revealed only upon claim approval.
- **Admin Moderation Panel**: Administrators can view all system listings, delete non-compliant posts, and deactivate or reactivate user accounts.
- **Zero-Setup Database Fallback**: Built-in standalone JSON file database (`server/data/*.json`) activates automatically if a local MongoDB service or Cloud Atlas instance is not running, allowing instant zero-dependency testing.
- **Global Toast & Theme System**: Accessible, persistent notification toasts across route navigation and theme state synchronization (light/dark/system).
- **Responsive Design**: Mobile-friendly layout with collapsed hamburger navigation and adaptive card grids.

---

## Tech Stack

- **Frontend**: React 18, React Router v6, Axios, Vite, Context API, Vanilla CSS design tokens.
- **Backend**: Node.js, Express 5, Express Validator, Express Rate Limit, Helmet, CORS.
- **Database & Storage**: MongoDB / Mongoose (with seamless local JSON DB proxy fallback), Multer, Cloudinary.
- **Security**: JWT authentication, bcrypt password hashing, IP rate limiting, authorization middlewares.

---

## Architecture Documentation

Comprehensive technical documentation is maintained in the `docs/` directory:

- [Technical Architecture Guide](./docs/ARCHITECTURE.md) - Deep dive into system layers, component hierarchies, and API specifications.
- [Product Requirements Document (PRD)](./docs/planning/01_PRD.md) - Functional and non-functional requirements.
- [Technical Requirements Document (TRD)](./docs/planning/02_TRD.md) - Stack choices and architecture boundaries.
- [Backend Schema & Indexing Plan](./docs/planning/04_BACKEND_SCHEMA.md) - Entity relationship models and indexes.
- [Architectural Decision Log](./docs/DECISIONS.md) - Formal log of all major engineering decisions (DEC-001 through DEC-010).
- [Git Branching Workflow](./docs/GIT_WORKFLOW.md) - Branching strategy (`main`, `staging`, `feature/*`).
- [Staging Environment Configuration](./docs/STAGING_ENVIRONMENT.md) - Render staging deployment setup.
- [Testing Verification Guide](./TESTING.md) - 20 official test cases (TC-01 through TC-20).

---

## Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or newer recommended)
- [npm](https://www.npmjs.com/) (v9 or newer)
- *(Optional)* MongoDB Community Server or MongoDB Atlas account

### 2. Installation

Clone the repository and install dependencies:

```bash
# Clone the repository
git clone https://github.com/abhinashmadd/find-lost-.git
cd "Find & lost"

# Install root dependencies
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install

# Return to root
cd ..
```

### 3. Environment Configuration

Copy the example environment files:

```bash
# Root environment
cp .env.example .env

# Server environment
cp server/.env.example server/.env

# Client environment
cp client/.env.example client/.env
```

#### Default Development Values:
- **`PORT`**: `5000`
- **`CLIENT_URL`**: `http://localhost:5173`
- **`VITE_API_URL`**: `http://localhost:5000/api`
- **`USE_LOCAL_DB`**: `true` *(set to `false` and configure `MONGODB_URI` to use MongoDB)*
- **Default Seed Accounts**:
  - Admin: `admin@example.com` / `Admin@1234`
  - User: `asha@example.com` / `Pass@1234`

---

## Running the Application

### Start Both Frontend and Backend Concurrently
```bash
npm run dev
```
- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

### Start Individual Services
```bash
# Backend server only (with nodemon auto-reload)
npm run server

# Frontend client only (Vite dev server)
npm run client
```

### Production Build
```bash
npm run build:client
```

---

## Testing & Verification

The project includes an official verification suite covering authentication, listings, uploads, claiming workflows, and administration:

See [TESTING.md](./TESTING.md) for step-by-step test cases, API endpoint documentation, and test criteria.

---

## Project Structure

```
.
├── client/                     # React 18 + Vite frontend
│   ├── src/
│   │   ├── components/         # Reusable UI library (Badge, Modal, FormField, etc.)
│   │   ├── config/             # Client environment configuration (env.js)
│   │   ├── constants/          # Shared system taxonomy & enums
│   │   ├── context/            # Global state (Auth, Theme, Toast)
│   │   ├── hooks/              # Reusable hooks (useDebounce, useItems)
│   │   ├── pages/              # View pages (Home, Listing, Details, Dashboard, Admin)
│   │   ├── services/           # Domain API service modules (auth, items, claims)
│   │   ├── utils/              # Formatting and display utilities
│   │   ├── App.jsx             # Root layout, error boundary, and routing
│   │   ├── index.css           # Collegiate design tokens and global styles
│   │   └── main.jsx            # Application entrypoint
│   └── package.json
│
├── server/                     # Express 5 REST API backend
│   ├── config/                 # Environment validation, DB connector, localDb proxy
│   ├── constants/              # Shared system enums (ItemStatus, Roles, Categories)
│   ├── controllers/            # Thin controller handlers (Auth, Item, Claim, Admin)
│   ├── data/                   # Standalone JSON database files (users, items, claims)
│   ├── middleware/             # Auth, errorHandler, asyncHandler, rateLimiter, upload
│   ├── models/                 # Mongoose models with local DB proxy routing
│   ├── public/uploads/         # Local uploaded file storage fallback
│   ├── routes/                 # Master router (index.js) and domain route modules
│   ├── utils/                  # AppError operational error utility
│   ├── validators/             # Modular express-validator rule chains
│   ├── nodemon.json            # Nodemon ignore settings
│   ├── package.json            # Server dependencies
│   ├── seed.js                 # Seed database records
│   └── server.js               # Server initialization and process lifecycle
│
├── docs/                       # Architecture and project documentation
│   ├── planning/               # Phase 1 planning deliverables (PRD, TRD, Schema, etc.)
│   ├── ARCHITECTURE.md         # Comprehensive system architecture documentation
│   ├── ASSUMPTIONS.md          # Architectural assumptions list
│   ├── DECISIONS.md            # Formal Decision Log (DEC-001 through DEC-010)
│   ├── GIT_WORKFLOW.md         # Version control branching model
│   └── STAGING_ENVIRONMENT.md  # Staging deployment configuration
│
├── .env.example                # Root environment template
├── .gitignore                  # Git ignore rules
├── package.json                # Root scripts and workspace orchestration
├── render.yaml                 # Staging & production deployment specification
├── README.md                   # Project overview and setup documentation
└── TESTING.md                  # Verification test cases (TC-01 through TC-20)
```

---

## License

This project is licensed under the ISC License.
