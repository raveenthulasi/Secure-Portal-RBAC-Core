# Secure Role-Based Access Control Portal (RBAC) - REST API Documentation

This document describes all REST API endpoints available in the **Secure Role-Based Access Control Portal**.

---

## 1. Architectural & Security Overview

- **Base URL**: `http://localhost:5000/api`
- **Authentication Scheme**: HTTP Authorization Header with JSON Web Token (`Bearer <JWT_TOKEN>`)
- **Default Expiration**: 24 hours (`24h`)
- **Password Encryption**: bcrypt (Salt Rounds = 10)
- **Database Engine**: MySQL 8.0+

### Dual-Layer Security Model
1. **Node.js Express Middleware**: Every protected endpoint independently checks the JWT token, verifies user existence and active status in MySQL, and strictly matches roles and granular permissions.
2. **Vue.js Route Guards**: The frontend router checks roles and permissions before rendering views. Direct URL tampering redirects unauthorized attempts to the custom HTTP 403 Forbidden page.

---

## 2. Standard HTTP Response Codes

| Status Code | Description | Scenario |
| :--- | :--- | :--- |
| `200 OK` | Request succeeded | Successful GET, PUT, or DELETE operation |
| `201 Created` | Resource created | Successful user creation |
| `400 Bad Request` | Validation failure | Missing required fields, invalid parameters, password too short |
| `401 Unauthorized` | Authentication failure | Missing, invalid, or expired JWT token, or incorrect login credentials |
| `403 Forbidden` | Authorization failure | Valid token, but role or permission does not allow access |
| `404 Not Found` | Resource not found | User, role, or endpoint does not exist |
| `409 Conflict` | Resource conflict | Email address is already in use by another account |
| `500 Server Error` | Unhandled error | Unexpected server or database exception |

---

## 3. Pre-Seeded Sample Accounts

| Role | Email | Password | Scope & Privileges |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@rbacportal.com` | `Admin@123` | Master superuser access; can manage users, roles, and security policies |
| **Regular User** | `user@rbacportal.com` | `User@123` | Scoped to own personal dashboard, profile editing, and password updates |
| **Regular User (HR)** | `jane.doe@rbacportal.com` | `User@123` | Standard user for multi-user directory testing |
| **Inactive User** | `inactive.user@rbacportal.com` | `User@123` | Deactivated account (tests HTTP 403 suspension lockouts) |

---

## 4. Authentication Endpoints (`/api/auth`)

### 4.1 Login
- **Endpoint**: `POST /api/auth/login`
- **Access**: Public
- **Request Body**:
```json
{
  "email": "admin@rbacportal.com",
  "password": "Admin@123"
}
```
- **Response `200 OK`**:
```json
{
  "success": true,
  "message": "Login successful.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "System Administrator",
    "email": "admin@rbacportal.com",
    "role": "admin",
    "role_display": "Administrator",
    "status": "active",
    "phone": "+1-555-0199",
    "department": "IT & Security Infrastructure",
    "last_login": "2026-11-05T14:48:00.000Z",
    "permissions": [
      "dashboard:admin",
      "dashboard:user",
      "users:read",
      "users:create",
      "users:update",
      "users:delete",
      "roles:read",
      "roles:manage",
      "profile:read",
      "profile:update",
      "settings:view"
    ]
  }
}
```
- **Response `401 Unauthorized`**:
```json
{
  "success": false,
  "message": "Invalid email or password."
}
```
- **Response `403 Forbidden` (Inactive Account)**:
```json
{
  "success": false,
  "message": "This account has been deactivated. Please contact your system administrator."
}
```

---

### 4.2 Get Current Authenticated Profile
- **Endpoint**: `GET /api/auth/me`
- **Access**: Authenticated (`verifyToken`)
- **Headers**: `Authorization: Bearer <token>`
- **Response `200 OK`**:
```json
{
  "success": true,
  "user": {
    "id": 1,
    "role_id": 1,
    "name": "System Administrator",
    "email": "admin@rbacportal.com",
    "status": "active",
    "phone": "+1-555-0199",
    "department": "IT & Security Infrastructure",
    "role": "admin",
    "role_display": "Administrator",
    "permissions": ["..."]
  }
}
```

---

### 4.3 Change Password
- **Endpoint**: `POST /api/auth/change-password`
- **Access**: Authenticated (`verifyToken`)
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
```json
{
  "currentPassword": "Admin@123",
  "newPassword": "NewAdminPassword@2026"
}
```
- **Response `200 OK`**:
```json
{
  "success": true,
  "message": "Password changed successfully."
}
```

---

### 4.4 Logout
- **Endpoint**: `POST /api/auth/logout`
- **Access**: Authenticated (`verifyToken`)
- **Headers**: `Authorization: Bearer <token>`
- **Response `200 OK`**:
```json
{
  "success": true,
  "message": "Logged out successfully."
}
```

---

## 5. User Management Endpoints (`/api/users`)

### 5.1 List All Users (with Search, Filtering, and Pagination)
- **Endpoint**: `GET /api/users`
- **Access**: Admin only (`roles: ['admin']`, `permission: 'users:read'`)
- **Query Parameters**:
  - `search` (string, optional): Search by name, email, or department
  - `role` (string, optional): Filter by role (`admin`, `user`)
  - `status` (string, optional): Filter by status (`active`, `inactive`)
  - `page` (number, optional, default: 1)
  - `limit` (number, optional, default: 10)
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "role_id": 1,
      "name": "System Administrator",
      "email": "admin@rbacportal.com",
      "status": "active",
      "phone": "+1-555-0199",
      "department": "IT & Security Infrastructure",
      "last_login": "2026-11-05T14:48:00.000Z",
      "created_at": "2026-11-05T14:48:00.000Z",
      "role_name": "admin",
      "role_display_name": "Administrator"
    }
  ],
  "pagination": {
    "total": 4,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```
- **Response `403 Forbidden` (Regular User access)**:
```json
{
  "success": false,
  "message": "Forbidden: Role 'user' does not have access to this resource. Required role: admin."
}
```

---

### 5.2 Create User
- **Endpoint**: `POST /api/users`
- **Access**: Admin only (`roles: ['admin']`, `permission: 'users:create'`)
- **Request Body**:
```json
{
  "name": "David Clark",
  "email": "david.clark@rbacportal.com",
  "password": "SecurePassword@123",
  "role_id": 2,
  "status": "active",
  "department": "Engineering",
  "phone": "+1-555-0811"
}
```
- **Response `201 Created`**:
```json
{
  "success": true,
  "message": "User created successfully.",
  "data": {
    "id": 5,
    "name": "David Clark",
    "email": "david.clark@rbacportal.com",
    "status": "active",
    "role_name": "user"
  }
}
```

---

### 5.3 Update User Details
- **Endpoint**: `PUT /api/users/:id`
- **Access**: Admin only (`roles: ['admin']`, `permission: 'users:update'`)
- **Request Body**:
```json
{
  "name": "David Clark Updated",
  "department": "DevOps & Cloud",
  "status": "active"
}
```
- **Response `200 OK`**:
```json
{
  "success": true,
  "message": "User updated successfully.",
  "data": { ... }
}
```

---

### 5.4 Delete User
- **Endpoint**: `DELETE /api/users/:id`
- **Access**: Admin only (`roles: ['admin']`, `permission: 'users:delete'`)
- **Self-Protection**: Administrators cannot delete their own account.
- **Response `200 OK`**:
```json
{
  "success": true,
  "message": "User 'David Clark' has been permanently deleted."
}
```
- **Response `400 Bad Request` (Attempting self-deletion)**:
```json
{
  "success": false,
  "message": "Action rejected: You cannot delete your own administrative account."
}
```

---

### 5.5 Update Own Profile
- **Endpoint**: `PUT /api/users/profile/me`
- **Access**: Authenticated (`permission: 'profile:update'`)
- **Request Body**:
```json
{
  "name": "Alex Johnson",
  "department": "Senior Financial Auditing",
  "phone": "+1-555-0145"
}
```
- **Response `200 OK`**:
```json
{
  "success": true,
  "message": "Profile updated successfully.",
  "data": { ... }
}
```

---

## 6. Roles & Permissions Endpoints (`/api/roles`)

### 6.1 List All Roles
- **Endpoint**: `GET /api/roles`
- **Access**: Admin only (`roles: ['admin']`, `permission: 'roles:read'`)
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "admin",
      "display_name": "Administrator",
      "description": "Full administrative access...",
      "user_count": 1,
      "permission_count": 11
    },
    {
      "id": 2,
      "name": "user",
      "display_name": "Regular User",
      "description": "Standard user access...",
      "user_count": 3,
      "permission_count": 4
    }
  ]
}
```

---

### 6.2 List All System Permissions
- **Endpoint**: `GET /api/roles/permissions`
- **Access**: Admin only (`roles: ['admin']`, `permission: 'roles:read'`)

---

### 6.3 Update Role Permissions Matrix
- **Endpoint**: `PUT /api/roles/:id/permissions`
- **Access**: Admin only (`roles: ['admin']`, `permission: 'roles:manage'`)
- **Request Body**:
```json
{
  "permission_ids": [2, 9, 10, 11]
}
```
- **Response `200 OK`**:
```json
{
  "success": true,
  "message": "Permissions updated successfully for role 'Regular User'.",
  "permissions": [ ... ]
}
```

---

## 7. Dashboard Endpoints (`/api/dashboard`)

### 7.1 Admin Dashboard Metrics
- **Endpoint**: `GET /api/dashboard/admin`
- **Access**: Admin only (`roles: ['admin']`, `permission: 'dashboard:admin'`)
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "metrics": {
      "totalUsers": 4,
      "activeUsers": 3,
      "inactiveUsers": 1,
      "totalRoles": 2,
      "totalPermissions": 11
    },
    "recentUsers": [ ... ],
    "recentLogs": [ ... ]
  }
}
```

---

### 7.2 Regular User Dashboard
- **Endpoint**: `GET /api/dashboard/user`
- **Access**: Authenticated (`permission: 'dashboard:user'`)
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "profile": { ... },
    "permissions": ["dashboard:user", "profile:read", "profile:update", "settings:view"],
    "recentActivity": [ ... ],
    "securityStatus": {
      "twoFactorEnabled": false,
      "accountStatus": "active"
    }
  }
}
```

---

## 8. System Health
- **Endpoint**: `GET /api/health`
- **Access**: Public
- **Response `200 OK`**:
```json
{
  "status": "online",
  "timestamp": "2026-11-05T14:48:00.000Z",
  "service": "RBAC Portal Backend API",
  "version": "1.0.0"
}
```

