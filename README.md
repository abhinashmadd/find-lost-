# 🔍 Campus Lost and Found Web Portal

A full-stack MERN (MongoDB, Express, React, Node.js) web application designed for college campuses to help students, faculty, and staff report, search, and recover lost and found belongings safely and transparently.

---

## 🌟 Key Features

- **User Authentication**: Secure user registration and login with bcrypt password hashing and JWT (7-day validity).
- **Report Items**: Report lost or found belongings with categories, event dates, detailed descriptions, and photo uploads (local disk or Cloudinary).
- **Search & Filter**: Real-time 500 ms debounced keyword search across titles, descriptions, and locations, with filtering by type (lost/found) and category.
- **Claim Management & Privacy**: Verified claimants can submit ownership claims with proof details. Reporter receives the claim and can approve or reject it; claimant contact information is protected and revealed only upon claim approval.
- **Admin Moderation Panel**: Administrators can view all system listings, delete non-compliant posts, and deactivate or reactivate user accounts.
- **Zero-Setup Database Fallback**: Built-in standalone JSON file database (`server/data/*.json`) activates automatically if a local MongoDB service or Cloud Atlas instance is not running, allowing instant zero-dependency testing.
- **Responsive Design**: Mobile-friendly layout with collapsed hamburger navigation and adaptive card grids.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, React Router v6, Axios, Vite, Vanilla CSS design system
- **Backend**: Node.js, Express 5, Express Validator, Express Rate Limit, Helmet, CORS
- **Database & Storage**: MongoDB / Mongoose (with seamless local JSON DB fallback), Multer, Cloudinary
- **Security**: JWT authentication, bcrypt password hashing, IP rate limiting, authorization middlewares

---

## 🚀 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or newer recommended)
- [npm](https://www.npmjs.com/) (v9 or newer)
- *(Optional)* MongoDB Community Server or MongoDB Atlas account

### 2. Installation

Clone the repository and install dependencies:

```bash
# Clone the repository
git clone <your-repo-url>
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
- **Default Admin Account**:
  - Email: `admin@example.com`
  - Password: `Admin@1234`

---

## 💻 Running the Application

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

## 🧪 Testing & Verification

The project includes an official verification guide with 20 test cases covering authentication, listings, uploads, claiming workflows, and administration:

See [TESTING.md](./TESTING.md) for step-by-step test cases, API endpoint documentation, and test criteria.

---

## 📂 Project Structure

```
.
├── client/                 # React 18 + Vite frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components (Navbar, ItemCard, Alert, etc.)
│   │   ├── context/        # AuthContext for session management
│   │   ├── pages/          # Home, Listing, ItemDetails, ReportItem, Dashboard, Admin, Login, Register
│   │   └── services/       # Axios API client
│   └── package.json
│
├── server/                 # Express backend API
│   ├── config/             # Database connection & standalone localDb fallback
│   ├── controllers/        # Auth, Items, Claims, Admin controllers
│   ├── data/               # Standalone database files (*.json)
│   ├── middleware/         # Auth, RateLimiter, Multer upload
│   ├── models/             # User, Item, Claim models with proxy routing
│   ├── routes/             # REST API routes
│   └── server.js
│
├── .gitignore              # Git ignore rules for node_modules, env, uploads
├── package.json            # Root scripts for concurrently running client & server
├── README.md               # Project documentation
└── TESTING.md              # 20 Official test cases and Postman reference
```

---

## 📄 License

This project is licensed under the ISC License.

