# Employee Directory with Role-Based Access Control (RBAC)

A modern full-stack MERN application for managing organizational employee records with role-based access control, secure JWT authentication, granular backend permission enforcement, and responsive UI.

---

## 1. Project Overview

The **Employee Directory** is designed to allow organizations to manage personnel records securely. Access to features and endpoints is strictly governed by **Role-Based Access Control (RBAC)** across two roles:
- **Admin**: Full control to create, view, update, delete employee records, export directory data as CSV, and promote registered users to the Admin role.
- **Viewer**: Read-only access to browse, search, filter, and view employee records and detailed profiles. Any attempt to modify data via the API is rejected with **HTTP 403 Forbidden**.

Live Application Links:
- **Frontend (Vercel)**: `https://<your-vercel-app-url>.vercel.app` *(Placeholder - configure upon deployment)*
- **Backend (Render)**: `https://<your-render-service-url>.onrender.com` *(Placeholder - configure upon deployment)*
- **Sample Test Endpoint**: `https://<your-render-service-url>.onrender.com/api/health`

---

## 2. Test Credentials

| Account Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@example.com` | `AdminPassword123!` | Full CRUD, User Role Promotion, CSV Export |
| **Viewer** | `viewer@example.com` | `ViewerPassword123!` | View Directory, View Profile Details (Read-only) |

> **Evaluator Tip**: The login page includes convenient **Quick Test Credential** buttons that automatically populate test credentials for one-click testing.

---

## 3. Key Features

### Core Functionality
- **Authentication**: JWT-based stateless authentication with password hashing using `bcryptjs` (passwords never stored or returned in plain text).
- **Backend RBAC Middleware**: Strict backend middleware enforcement. Viewers attempting mutation requests (`POST`, `PUT`, `DELETE`) via curl, Postman, or frontend receive an explicit **HTTP 403 Forbidden** response.
- **Employee Directory**:
  - Employee Listing: Clean table view with status indicators and quick action shortcuts.
  - Search: Real-time search across Name, Employee ID, Email, and Designation.
  - Filters: Filter by Department (e.g., Engineering, HR, Marketing) and Status (`Active` / `Inactive`).
  - Employee Details Page: Dedicated route (`/employees/:id`) showing comprehensive profile information (accessible in read-only mode for Viewers).
  - Add & Edit Forms: Modal dialogs with input validation (Full Name, unique Employee ID, valid Email, Department, Designation, Date of Joining, Status).
  - Deletion Guard: Dedicated confirmation prompt before permanently deleting any employee record.
  - User Role Promotion: Existing Admins can promote registered Viewers to the Admin role (`PATCH /api/users/:id/role`).

### Stretch Goals Implemented
- **Server-side Pagination**: Dynamic page numbers, next/prev navigation, and customizable page limit (5, 10, 20 items per page).
- **CSV Data Export**: Admins can export the complete employee directory as a downloadable `.csv` file.
- **Dark Mode**: Class-based theme switcher with persistence in `localStorage`.
- **Backend Test Suite**: Automated integration tests using Jest and Supertest (`tests/auth.test.js`, `tests/rbac.test.js`).
- **Database Seeder**: Preloaded with Admin, Viewer, and 12 realistic employee profiles across multiple departments.

---

## 4. Technology Stack

- **Frontend**: React 18, Vite, React Router v6, Tailwind CSS, Axios, Lucide React icons
- **Backend**: Node.js, Express.js, Mongoose ODM
- **Database**: MongoDB Atlas
- **Security & Utilities**: `jsonwebtoken` (JWT), `bcryptjs`, `cors`, `dotenv`
- **Testing**: Jest, Supertest, `mongodb-memory-server`

---

## 5. Architecture & Project Structure

```text
nirveonxassignment/
├── client/                     # Frontend React application (Vite)
│   ├── public/
│   ├── src/
│   │   ├── api/                # Axios instance & request/response interceptors
│   │   ├── components/         # Table, Modals, Navbar, Pagination, ProtectedRoute
│   │   ├── context/            # AuthContext, ThemeContext
│   │   ├── pages/              # Login, Register, Dashboard, EmployeeDetails, NotFound
│   │   ├── App.jsx             # Client-side router & route protection
│   │   ├── main.jsx
│   │   └── index.css           # Tailwind CSS directives
│   ├── .env.example
│   ├── tailwind.config.js
│   ├── vercel.json             # SPA routing rewrite rule for Vercel
│   └── package.json
│
├── server/                     # Backend REST API (Node.js & Express)
│   ├── src/
│   │   ├── config/             # MongoDB connection (db.js)
│   │   ├── controllers/        # authController, employeeController, userController
│   │   ├── middleware/         # authMiddleware (JWT & RBAC), errorHandler
│   │   ├── models/             # User.js, Employee.js (Mongoose schemas)
│   │   ├── routes/             # authRoutes, employeeRoutes, userRoutes
│   │   ├── utils/              # jwt.js
│   │   ├── app.js              # Express app setup (isolated for testing)
│   │   ├── server.js           # Server bootstrap & port listener
│   │   └── seed.js             # Database seeding script
│   ├── tests/                  # Jest & Supertest integration tests
│   │   ├── auth.test.js        # Registration & login tests
│   │   ├── rbac.test.js        # Strict 403 Forbidden RBAC permission tests
│   │   └── setup.js            # In-memory Mongo test database setup
│   ├── .env.example
│   └── package.json
│
├── .gitignore
├── README.md
└── DEFENSE_GUIDE.md            # Conceptual guide to defend project in interviews
```

---

## 6. Environment Variables

### Backend (`server/.env`)
| Variable | Description | Example |
| :--- | :--- | :--- |
| `PORT` | Local server port | `5000` |
| `NODE_ENV` | Environment mode | `development` / `production` |
| `MONGODB_URI` | MongoDB Atlas cluster connection string | `mongodb+srv://<user>:<password>@cluster0.mongodb.net/employee_directory` |
| `JWT_SECRET` | Secret key used to sign and verify JWTs | `super_secret_jwt_random_key_min_32_chars` |
| `JWT_EXPIRES_IN` | Token validity period | `7d` |
| `CORS_ORIGIN` | Allowed origins (comma-separated for multiple) | `http://localhost:5173,https://your-frontend.vercel.app` |

### Frontend (`client/.env`)
| Variable | Description | Example |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Base URL of deployed backend (leave empty for dev proxy) | `https://your-backend.onrender.com` |

---

## 7. Setup & Local Installation

### Prerequisites
- Node.js (v18.0.0 or later)
- npm (v9.0.0 or later)
- MongoDB Atlas account (or local MongoDB instance)

### 1. Clone the repository
```bash
git clone <your-repository-url>
cd nirveonxassignment
```

### 2. Backend Setup
```bash
cd server
npm install

# Create environment configuration
cp .env.example .env
# Edit .env with your MONGODB_URI and JWT_SECRET

# Seed the database with default Admin, Viewer, and Sample Employees
npm run seed

# Run automated tests
npm test

# Start backend server in development mode
npm run dev
```
Backend runs at `http://localhost:5000`.

### 3. Frontend Setup
Open a new terminal:
```bash
cd client
npm install

# Create environment configuration (optional for local dev)
cp .env.example .env

# Start frontend development server
npm run dev
```
Frontend runs at `http://localhost:5173`.

---

## 8. API Specification

### Authentication Routes (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register a new user (`name`, `email`, `password`, `role`) |
| `POST` | `/api/auth/login` | Public | Authenticate user, return JWT and user payload |
| `GET` | `/api/auth/me` | Authenticated | Retrieve current user profile from JWT |

### Employee Routes (`/api/employees`)
| Method | Endpoint | Access | Status | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/employees` | Admin, Viewer | `200` | List employees with search, filter, and pagination |
| `GET` | `/api/employees/:id` | Admin, Viewer | `200` | Fetch individual employee details |
| `POST` | `/api/employees` | **Admin only** | `201` | Create new employee record (`403` for Viewer) |
| `PUT` | `/api/employees/:id` | **Admin only** | `200` | Update employee information (`403` for Viewer) |
| `DELETE`| `/api/employees/:id` | **Admin only** | `200` | Permanently delete employee record (`403` for Viewer) |
| `GET` | `/api/employees/export/csv` | **Admin only** | `200` | Export employee records as downloadable CSV |

### User Management Routes (`/api/users`)
| Method | Endpoint | Access | Status | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/users` | **Admin only** | `200` | View all registered users |
| `PATCH`| `/api/users/:id/role`| **Admin only** | `200` | Promote / update user role (`Admin` / `Viewer`) |

### Health Check
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | Server uptime and health verification |

---

## 9. Assumptions Made During Development

1. **Role Selection on Registration**: As allowed by the specification ("During signup, users can either select a role between Admin and Viewer, or new users can be assigned the Viewer role by default"), the signup form defaults to `Viewer` while enabling manual selection for ease of evaluation.
2. **Backend Defense in Depth**: Frontend UI hides modification buttons for `Viewer` users, but the backend independently enforces authorization via `authorize('Admin')` middleware. Unauthorized mutation requests explicitly return `HTTP 403 Forbidden`.
3. **Employee Identifier Format**: `employeeId` is uppercase alphanumeric (e.g., `EMP-001`) with a strict unique index in MongoDB. Attempts to insert or update duplicate IDs return `HTTP 409 Conflict` with clear error details instead of generic 500 crashes.
4. **Vercel Client Routing**: Added `vercel.json` rewrite configuration so direct navigation and browser refreshes on routes like `/dashboard` and `/employees/:id` do not trigger 404 errors on Vercel.

---

## 10. Deployment Guide

### Backend to Render
1. Push your repository to GitHub.
2. Log in to [Render Dashboard](https://dashboard.render.com/) and create a new **Web Service**.
3. Select your repository and configure:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `node src/server.js`
4. In **Environment Variables**, add:
   - `MONGODB_URI`: `<your MongoDB Atlas URI>`
   - `JWT_SECRET`: `<your secure random string>`
   - `CORS_ORIGIN`: `https://<your-vercel-domain>.vercel.app`
   - `NODE_ENV`: `production`
5. Deploy service and copy the live URL (e.g., `https://employee-directory-api.onrender.com`).

### Frontend to Vercel
1. Log in to [Vercel](https://vercel.com/) and click **Add New Project**.
2. Import the GitHub repository and configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
3. In **Environment Variables**, add:
   - `VITE_API_BASE_URL`: `https://employee-directory-api.onrender.com` (your Render backend URL)
4. Click **Deploy**.
