# Employee Directory with Role-Based Access Control

## Project Overview
Employee Directory is a full-stack MERN application that allows organizations to securely manage personnel records. Access to operations is strictly governed by Role-Based Access Control (RBAC):
- **Admin**: Full access to create, view, update, delete employee records, export directory data as CSV, and promote registered users to the Admin role.
- **Viewer**: Read-only access to browse, search, filter, and view employee details. Any attempt by a Viewer to mutate records is rejected on the backend with HTTP 403 Forbidden.

---

## Features
- **User Authentication**: Secure signup and login using JSON Web Tokens (JWT) and passwords hashed with `bcryptjs`.
- **Role-Based Access Control (RBAC)**: Backend middleware authorization enforcing `Admin` and `Viewer` privileges. Returns `HTTP 403 Forbidden` for unauthorized actions.
- **Employee Directory Management**:
  - Employee listing in a clean table view.
  - Search employees by name, ID, email, or designation.
  - Filter employees by department and employment status (`Active` / `Inactive`).
  - Add and Edit employee forms with validation.
  - Delete employee with an explicit confirmation prompt.
  - Dedicated individual employee details page (`/employees/:id`), view-only for Viewers.
- **Admin User Management**: Existing Admins can promote registered Viewers to the Admin role.
- **Pagination**: Server-side pagination controls with customizable rows per page.
- **CSV Export**: Admins can export all employee records into a downloadable `.csv` file.
- **Dark Mode**: Built-in dark mode toggle with theme persistence in `localStorage`.

---

## Technology Stack
- **Frontend**: React.js (v18), Vite, Tailwind CSS, React Router (v6), Axios, Lucide React
- **Backend**: Node.js, Express.js, Mongoose ODM
- **Database**: MongoDB Atlas
- **Authentication**: JSON Web Tokens (JWT), `bcryptjs`
- **Deployment**: Vercel (Frontend), Render (Backend)

---

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- npm (v9+)
- MongoDB Atlas database cluster

### 1. Clone the repository
```bash
git clone https://github.com/Jiteshreddy123/Nirveonxassign.git
cd Nirveonxassign
```

### 2. Backend Setup
```bash
cd server
npm install
```
Create a `.env` file in the `server` directory and add the required environment variables:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
CORS_ORIGIN=http://localhost:5173
```
Seed the database with default Admin, Viewer, and sample employees:
```bash
npm run seed
```
Start the backend server:
```bash
npm run dev
```

### 3. Frontend Setup
In a new terminal:
```bash
cd client
npm install
```
Start the frontend development server:
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## Environment Variable Requirements

### Backend (`server/.env`)
- `PORT`: Port number for the server (e.g., `5000`)
- `NODE_ENV`: Application environment (`development` or `production`)
- `MONGODB_URI`: MongoDB Atlas connection URI string
- `JWT_SECRET`: Secret key used to sign and verify JWT tokens
- `CORS_ORIGIN`: Allowed origins for CORS (e.g., `http://localhost:5173` or your Vercel URL)

### Frontend (`client/.env`)
- `VITE_API_BASE_URL`: Base URL of the deployed backend API (leave empty for local Vite proxy, or set to your Render URL for production)

---

## API Information

### Authentication Endpoints (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register a new user (`name`, `email`, `password`, `role`) |
| `POST` | `/api/auth/login` | Public | Authenticate user credentials and return JWT |
| `GET` | `/api/auth/me` | Authenticated | Fetch current authenticated user profile |

### Employee Endpoints (`/api/employees`)
| Method | Endpoint | Access | Status Code | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/employees` | Admin, Viewer | `200 OK` | Fetch employees with search, filter, and pagination |
| `GET` | `/api/employees/:id` | Admin, Viewer | `200 OK` | Fetch individual employee details |
| `POST` | `/api/employees` | Admin only | `201 Created` | Create new employee record (`403` for Viewer) |
| `PUT` | `/api/employees/:id` | Admin only | `200 OK` | Update existing employee record (`403` for Viewer) |
| `DELETE` | `/api/employees/:id` | Admin only | `200 OK` | Delete employee record (`403` for Viewer) |
| `GET` | `/api/employees/export/csv` | Admin only | `200 OK` | Export all employees as CSV file |

### User Management Endpoints (`/api/users`)
| Method | Endpoint | Access | Status Code | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/users` | Admin only | `200 OK` | List all registered users |
| `PATCH` | `/api/users/:id/role` | Admin only | `200 OK` | Update user role (`Admin` / `Viewer`) |

### Health Check Endpoint
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | Server uptime and health status verification |

---

## Any Assumptions Made During Development
1. **Default Role on Signup**: Users default to the `Viewer` role upon registration, while also allowing role selection during signup as permitted by the specification.
2. **Backend-Enforced Authorization**: Frontend hides restricted buttons based on role for UX, but all mutation actions (`POST`, `PUT`, `DELETE`) are strictly guarded on the backend using Express middleware that returns `HTTP 403 Forbidden` if a Viewer attempts them.
3. **Unique Employee ID**: `employeeId` is an uppercase alphanumeric string that is strictly unique in MongoDB. Duplicate additions return `HTTP 409 Conflict`.
4. **Single-Page Application Routing**: Added `vercel.json` rewrite configuration so direct URL access and page refreshes on paths like `/dashboard` and `/employees/:id` do not result in 404 errors on Vercel.

---

## Live Application
- **Frontend URL (Vercel)**: https://nirveonxassign.vercel.app
- **Backend URL (Render)**: https://nirveonxassign.onrender.com
- **Sample API Endpoint**: https://nirveonxassign.onrender.com/api/health

---

## Test Credentials

### Admin Account
- **Email**: `admin@example.com`
- **Password**: `AdminPassword123!`

### Viewer Account
- **Email**: `viewer@example.com`
- **Password**: `ViewerPassword123!`
