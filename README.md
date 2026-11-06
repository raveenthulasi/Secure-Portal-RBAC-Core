# Secure Role-Based Access Control Portal (RBAC)

An enterprise-grade, modern, and responsive full-stack web application implementing strict **Role-Based Access Control (RBAC)**, token-based authentication, and cryptographic access validation.

Built with **Vue.js 3 (Composition API)**, **Node.js**, **Express.js**, and **MySQL**.

---

## 1. Project Objectives & Core Architecture

The **Secure RBAC Portal** provides completely isolated access, dedicated dashboards, distinct navigation trees, and strict API access controls for two primary user roles:

1. **Administrator (`admin`)**: Unrestricted administrative governance, comprehensive statistics, full user CRUD operations, role assignment, permissions matrix configuration, and audit log inspection.
2. **Regular User (`user`)**: Scoped to a personal user dashboard, profile viewing/editing, password updates, and permitted resource viewing. Blocked both on the frontend (Route Guards & 403 Forbidden page) and backend (Authorization Middleware) from accessing administrative resources.

---

## 2. Technology Stack

### Frontend
- **Framework**: Vue.js 3 (Composition API `<script setup>`)
- **Routing**: Vue Router 4 (Dynamic Navigation Guards for auth, roles, and permissions)
- **HTTP Client**: Axios (with Request/Response Interceptors for Bearer JWT & 401/403 redirects)
- **Styling**: Modern Enterprise CSS Design System (Custom corporate blue/slate/white palette, responsive layout, glassmorphism, animated toasts)
- **Build Tool**: Vite 6

### Backend
- **Runtime**: Node.js (v20+)
- **Web Framework**: Express.js 4
- **Authentication**: JSON Web Tokens (`jsonwebtoken`) with expiration
- **Password Security**: bcrypt (`bcryptjs` with 10 salt rounds)
- **Middleware**: Custom token verification, role enforcement, and granular permission checking
- **Logging**: Morgan HTTP logger and dedicated MySQL activity audit trail

### Database
- **Database Engine**: MySQL 8.0+
- **Driver**: `mysql2/promise` with high-performance connection pooling
- **Schema**: Normalized relational architecture (`users`, `roles`, `permissions`, `role_permissions`, `activity_logs`)

---

## 3. Pre-Configured Test Accounts

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@rbacportal.com` | `Admin@123` | Full access to Admin Dashboard, User Management, Roles & Permissions Matrix |
| **Regular User** | `user@rbacportal.com` | `User@123` | Standard access to User Dashboard, My Profile, Account Settings |
| **Regular User (HR)** | `jane.doe@rbacportal.com` | `User@123` | Additional active user for directory testing |
| **Inactive Account** | `inactive.user@rbacportal.com` | `User@123` | Demonstrates immediate 403 Deactivated Account lockout |

> **Pro Tip**: The login screen features one-click **Quick Fill Demo Accounts** buttons for instant testing.

---

## 4. Key Functional Modules

### 4.1 Authentication Module
- Clean enterprise login page with dual-tone branding.
- Work email and password input with **password visibility toggle**.
- Real-time client and server form validation.
- Secure JWT generation and localStorage session hydration.
- Automatic session expiration and 401 redirect handling.
- Graceful logout clearing client session and recording an audit event.

### 4.2 Admin Dashboard (`/admin/dashboard`)
- High-level metric cards: Total Users, Active Users, Inactive Users, Roles & Permissions count.
- Quick navigation shortcuts to User Management and Roles Matrix.
- Recent User Registrations table.
- Real-time **Security & Audit Logs** monitor displaying authentication events, IP addresses, and timestamps.

### 4.3 User Management (`/admin/users`)
- Complete User CRUD: View all registered users, add new users, edit user details, and delete accounts.
- **Search & Filtering**: Live search by name, email, or department; filter by role (`admin`, `user`) and status (`active`, `inactive`).
- **Pagination**: Clean previous/next page navigation.
- **Self-Deletion Protection**: Prevents administrators from deleting their own account.
- **Confirmation Modals**: Delete actions require explicit confirmation via custom modal dialogs.

### 4.4 Roles & Permissions Matrix (`/admin/roles`)
- Role summary cards showing user counts and assigned permissions.
- Interactive permission checklist grouped by modules (`dashboard`, `users`, `roles`, `profile`, `settings`).
- Admin can dynamically check/uncheck permissions for roles and click **Save Permission Policy** to persist changes immediately to MySQL.

### 4.5 Regular User Dashboard (`/user/dashboard`)
- Personalized greeting banner with user initials, role badge, email, and department.
- **Permitted Information**: Clear checklist of allowed features versus blocked administrative actions.
- Account Security Checklist displaying encryption, session token, and account status.
- Quick links to Profile and Settings.

### 4.6 My Profile & Settings (`/profile`, `/settings`)
- View and update own contact details (name, phone, department).
- Change password with old password verification and minimum 6-character validation.
- Portal session settings, CORS, and cryptographic parameters review.

### 4.7 Route Guards & Error Pages
- **Vue Router Guards**: Inspects `meta.requiresAuth`, `meta.roles`, and `meta.permission` before route transitions.
- **HTTP 403 Forbidden Page**: Styled page informing unauthorized users of the permission shortfall with a button to return to their role dashboard.
- **HTTP 404 Not Found Page**: Catch-all for non-existent paths.

---

## 5. Database Schema & ER Design

```
+----------------+          +--------------------+          +--------------------+
|     roles      | 1      * |  role_permissions  | *      1 |    permissions     |
+----------------+----------+--------------------+----------+--------------------+
| id (PK)        |          | role_id (PK, FK)   |          | id (PK)            |
| name           |          | permission_id (FK) |          | name               |
| display_name   |          +--------------------+          | display_name       |
| description    |                                          | module             |
+-------+--------+                                          | description        |
        | 1                                                 +--------------------+
        |
        | *
+-------+--------+          +--------------------+
|     users      | 1      * |   activity_logs    |
+----------------+----------+--------------------+
| id (PK)        |          | id (PK)            |
| role_id (FK)   |          | user_id (FK)       |
| name           |          | user_email         |
| email (UNIQUE) |          | action             |
| password (hash)|          | details            |
| status         |          | ip_address         |
| phone          |          | created_at         |
| department     |          +--------------------+
| last_login     |
+----------------+
```

Schema file located at: `backend/scripts/schema.sql`  
Automatic seeder script: `backend/scripts/initDb.js`

---

## 6. Project Directory Structure

```
project/
├── API_DOCUMENTATION.md          # Complete REST API specification
├── README.md                     # Comprehensive project documentation
├── package.json                  # Root runner script orchestration
├── backend/
│   ├── config/
│   │   ├── config.js             # Environment variables & DB parameters
│   │   └── db.js                 # MySQL2 promise connection pool
│   ├── controllers/
│   │   ├── authController.js     # Login, logout, profile, password change
│   │   ├── dashboardController.js# Admin & User metrics aggregation
│   │   ├── roleController.js     # Roles & permissions management
│   │   └── userController.js     # User CRUD operations & profile update
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT Bearer verification & status checks
│   │   ├── errorMiddleware.js    # Centralized 404 and 500 error handlers
│   │   ├── permissionMiddleware.js# Granular permission authorization
│   │   └── roleMiddleware.js     # Role-based restriction middleware
│   ├── models/
│   │   ├── activityLogModel.js   # Audit logs data queries
│   │   ├── permissionModel.js    # Permissions data queries
│   │   ├── roleModel.js          # Roles & role-permissions queries
│   │   └── userModel.js          # Users SQL queries & stats
│   ├── routes/
│   │   ├── authRoutes.js         # Authentication endpoints
│   │   ├── dashboardRoutes.js    # Dashboard metrics endpoints
│   │   ├── roleRoutes.js         # Role management endpoints
│   │   └── userRoutes.js         # User CRUD endpoints
│   ├── scripts/
│   │   ├── initDb.js             # MySQL database creator & seed runner
│   │   └── schema.sql            # Raw DDL SQL definitions
│   ├── tests/
│   │   └── rbac.test.js          # Automated integration test suite
│   ├── .env                      # Local environment configuration
│   ├── .env.example              # Example environment configuration
│   ├── package.json              # Backend dependencies & scripts
│   └── server.js                 # Express server & static asset host
└── frontend/
    ├── public/                   # Static assets & favicon
    ├── src/
    │   ├── assets/
    │   │   └── main.css          # Design system & responsive styles
    │   ├── components/
    │   │   ├── AppNavbar.vue     # Top navbar with user profile dropdown
    │   │   ├── AppSidebar.vue    # Role-based dynamic sidebar navigation
    │   │   ├── ConfirmationModal.vue # Custom modal for delete confirmation
    │   │   ├── StatCard.vue      # Metric statistics card
    │   │   ├── ToastContainer.vue# Real-time toast notifications system
    │   │   └── UserModal.vue     # Add / Edit user form modal
    │   ├── router/
    │   │   └── index.js          # Vue Router setup & Navigation Guards
    │   ├── services/
    │   │   ├── api.js            # Axios client with interceptors
    │   │   ├── authService.js    # Auth HTTP requests
    │   │   ├── dashboardService.js# Dashboard HTTP requests
    │   │   ├── roleService.js    # Role & permission HTTP requests
    │   │   └── userService.js    # User CRUD HTTP requests
    │   ├── store/
    │   │   ├── auth.js           # Reactive auth store & permission helpers
    │   │   └── toast.js          # Toast state management
    │   ├── views/
    │   │   ├── AdminDashboardView.vue  # Overview for Admin
    │   │   ├── ForbiddenView.vue       # Custom 403 error page
    │   │   ├── LoginView.vue           # Modern sign-in page
    │   │   ├── NotFoundView.vue        # 404 error page
    │   │   ├── ProfileView.vue         # Profile & password change
    │   │   ├── RolesPermissionsView.vue# Roles matrix view
    │   │   ├── SettingsView.vue        # Portal settings
    │   │   ├── UserDashboardView.vue   # Personal overview for Regular User
    │   │   └── UsersManagementView.vue # User CRUD & directory
    │   ├── App.vue               # Main app component
    │   └── main.js               # Vue app initialization
    ├── index.html                # Entry HTML document
    ├── package.json              # Frontend dependencies
    └── vite.config.js            # Vite configuration with API proxy
```

---

## 7. Step-by-Step Installation & Execution Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher
- **MySQL Server**: v8.0 or higher running on port `3306`

---

### Step 1: Configure Environment Variables
Inside the `backend/` directory, create or inspect `.env`:
```env
PORT=5000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=root
DB_NAME=rbac_portal_db
JWT_SECRET=super_secret_rbac_jwt_key_2026_secure_portal
JWT_EXPIRES_IN=24h
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

---

### Step 2: Initialize Database and Seed Test Accounts
Run the automated database initialization script:
```bash
cd backend
npm run init-db
```
This automatically creates the database `rbac_portal_db`, sets up all relational tables, seeds permissions, and creates the Admin, Regular User, and Inactive test accounts with salted bcrypt password hashes.

---

### Step 3: Run the Application

#### Option A: Unified Full-Stack Mode (Single Command)
The frontend has already been built into `frontend/dist`. You can run the entire full-stack application from the `backend` folder:
```bash
cd backend
npm start
```
Open your browser to:
👉 **`http://localhost:5000`**

#### Option B: Split Development Mode (Hot Reload)
To run frontend and backend independently with hot module replacement:

1. **Start Backend API** (Terminal 1):
   ```bash
   cd backend
   npm run dev
   # Runs on http://localhost:5000
   ```

2. **Start Frontend Dev Server** (Terminal 2):
   ```bash
   cd frontend
   npm run dev
   # Runs on http://localhost:5173 (proxies /api to 5000)
   ```
Open your browser to:
👉 **`http://localhost:5173`**

---

## 8. Verification & Automated Test Suite

The project includes an automated test suite verifying all 9 required project scenarios:

```bash
cd backend
npm test
```

### Test Suite Execution Output
```
==================================================
 Starting RBAC Portal Automated Integration Tests
==================================================

[Scenario 1] Admin Authentication & Admin Dashboard Access
  ✓ PASS: Admin login HTTP 200
  ✓ PASS: Admin token received and role is admin
  ✓ PASS: Admin access to /api/dashboard/admin HTTP 200
  ✓ PASS: Admin dashboard metrics retrieved

[Scenario 2] Regular User Authentication & User Dashboard Access
  ✓ PASS: User login HTTP 200
  ✓ PASS: User token received and role is user
  ✓ PASS: User access to /api/dashboard/user HTTP 200
  ✓ PASS: User personal dashboard profile loaded

[Scenario 3] Admin User Management Operations
  ✓ PASS: Admin can list registered users
  ✓ PASS: Admin can create new user
  ✓ PASS: Admin can update user details
  ✓ PASS: Admin can delete user

[Scenario 4] Regular User Access Forbidden on Admin APIs
  ✓ PASS: User blocked from /api/dashboard/admin with HTTP 403
  ✓ PASS: User blocked from /api/users with HTTP 403
  ✓ PASS: User blocked from /api/roles with HTTP 403

[Scenario 5] Unauthenticated Access Blocked (HTTP 401)
  ✓ PASS: No token request returns HTTP 401
  ✓ PASS: No token user dashboard returns HTTP 401

[Scenario 6] Unauthorized Modification Rejected (HTTP 403)
  ✓ PASS: Regular user cannot create users (HTTP 403)

[Scenario 7] Invalid Login Error Handling
  ✓ PASS: Wrong password returns HTTP 401
  ✓ PASS: Error message informs user of invalid credentials
  ✓ PASS: Nonexistent email returns HTTP 401

[Scenario 8] Expired / Tampered JWT Token Rejection
  ✓ PASS: Expired token returns HTTP 401
  ✓ PASS: Error message specifies token expiration
  ✓ PASS: Tampered token returns HTTP 401

[Scenario 9] Logout Handling
  ✓ PASS: Logout endpoint returns HTTP 200
  ✓ PASS: Logout reported success

==================================================
 Test Results: 26 Passed, 0 Failed
==================================================
```

---

## 9. Academic & Corporate Project Deliverables Checklist

- [x] Complete Vue 3 frontend source code with Composition API and Vue Router
- [x] Complete Node.js Express backend source code with modular architecture
- [x] Normalized MySQL database schema with relationships and foreign keys
- [x] Bcrypt password hashing and JWT token verification
- [x] Dual-layer authorization: Vue Router Navigation Guards + Express Middleware
- [x] Dedicated Admin Dashboard and isolated Regular User Dashboard
- [x] Dynamic Sidebar navigation menus tailored to user role and permissions
- [x] Custom HTTP 401, 403 Forbidden, and 404 Not Found error pages
- [x] User management CRUD with search, filtering, and confirmation modals
- [x] Interactive Roles & Permissions matrix editor
- [x] Real-time Toast notification system
- [x] Automated test suite verifying all 9 security scenarios
- [x] REST API documentation (`API_DOCUMENTATION.md`)
- [x] Production build and unified server hosting

