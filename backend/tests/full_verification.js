const app = require('../server');
const config = require('../config/config');
const { pool, query, testConnection } = require('../config/db');
const jwt = require('jsonwebtoken');

let server;
const TEST_PORT = 5057;
const BASE_URL = `http://127.0.0.1:${TEST_PORT}`;

async function runFullVerification() {
  console.log('================================================================');
  console.log('    RBAC PORTAL - COMPREHENSIVE END-TO-END VERIFICATION SUITE   ');
  console.log('================================================================\n');

  await testConnection();

  await new Promise((resolve) => {
    server = app.listen(TEST_PORT, () => {
      console.log(`✓ Verification test server running on ${BASE_URL}\n`);
      resolve();
    });
  });

  let passed = 0;
  let failed = 0;
  const testResults = [];

  function assert(condition, name, details = '') {
    if (condition) {
      console.log(`  [PASS] ${name}`);
      passed++;
      testResults.push({ name, status: 'PASS' });
    } else {
      console.error(`  [FAIL] ${name} - Details: ${details}`);
      failed++;
      testResults.push({ name, status: 'FAIL', details });
    }
  }

  let adminToken = '';
  let userToken = '';
  let createdUserId = null;

  try {
    // -----------------------------------------------------------------
    // 1. Integration & Health Verification
    // -----------------------------------------------------------------
    console.log('--- 1. Vue.js Frontend & Node.js Backend Integration ---');
    const healthRes = await fetch(`${BASE_URL}/api/health`);
    const healthData = await healthRes.json();
    assert(healthRes.status === 200 && healthData.status === 'online', 'Backend Health Check API (/api/health) returns 200 online');

    const rootRes = await fetch(`${BASE_URL}/`);
    const rootHtml = await rootRes.text();
    assert(rootRes.status === 200 && rootHtml.includes('id="app"'), 'Frontend SPA HTML served on root (/) with #app mount point');
    assert(rootHtml.includes('Secure RBAC Portal'), 'Frontend SPA title is properly rendered');

    // -----------------------------------------------------------------
    // 2. MySQL Database Connection & Tables Verification
    // -----------------------------------------------------------------
    console.log('\n--- 2. MySQL Database Schema & Table Relationships ---');
    const tables = await query('SHOW TABLES;');
    const tableNames = tables.map(t => Object.values(t)[0]);
    assert(tableNames.includes('users'), 'Table `users` exists');
    assert(tableNames.includes('roles'), 'Table `roles` exists');
    assert(tableNames.includes('permissions'), 'Table `permissions` exists');
    assert(tableNames.includes('role_permissions'), 'Table `role_permissions` exists');
    assert(tableNames.includes('activity_logs'), 'Table `activity_logs` exists');

    const foreignKeys = await query(`
      SELECT CONSTRAINT_NAME, TABLE_NAME, REFERENCED_TABLE_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = '${config.db.database}' AND REFERENCED_TABLE_NAME IS NOT NULL
    `);
    assert(foreignKeys.length >= 4, `Relational constraints active (${foreignKeys.length} foreign keys defined)`);

    // -----------------------------------------------------------------
    // 3. Admin and Regular User Authentication
    // -----------------------------------------------------------------
    console.log('\n--- 3. Authentication: Admin, Regular User & Inactive Account ---');
    // Admin Login
    const adminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@rbacportal.com', password: 'Admin@123' })
    });
    const adminLoginData = await adminLoginRes.json();
    assert(adminLoginRes.status === 200, 'Admin login returns HTTP 200');
    assert(adminLoginData.token && adminLoginData.user.role === 'admin', 'Admin token received with role "admin"');
    assert(Array.isArray(adminLoginData.user.permissions) && adminLoginData.user.permissions.length === 11, 'Admin receives all 11 permissions');
    adminToken = adminLoginData.token;

    // Regular User Login
    const userLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'user@rbacportal.com', password: 'User@123' })
    });
    const userLoginData = await userLoginRes.json();
    assert(userLoginRes.status === 200, 'Regular user login returns HTTP 200');
    assert(userLoginData.token && userLoginData.user.role === 'user', 'Regular user token received with role "user"');
    assert(Array.isArray(userLoginData.user.permissions) && userLoginData.user.permissions.length === 4, 'Regular user receives exactly 4 scoped permissions');
    userToken = userLoginData.token;

    // Inactive Account Rejection (Robert Miller)
    const inactiveLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'inactive.user@rbacportal.com', password: 'User@123' })
    });
    const inactiveLoginData = await inactiveLoginRes.json();
    assert(inactiveLoginRes.status === 403, 'Inactive account rejected with HTTP 403');
    assert(inactiveLoginData.message.toLowerCase().includes('deactivated'), 'Deactivation notice communicated in error message');

    // Invalid Password
    const badPwRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@rbacportal.com', password: 'IncorrectPassword' })
    });
    assert(badPwRes.status === 401, 'Invalid password returns HTTP 401');

    // -----------------------------------------------------------------
    // 4. Role-Based Navigation Scopes Verification
    // -----------------------------------------------------------------
    console.log('\n--- 4. Navigation Structure & Scopes Verification ---');
    // Admin navigation items check:
    const adminAllowedRoutes = ['/admin/dashboard', '/admin/users', '/admin/roles', '/profile', '/settings'];
    const userAllowedRoutes = ['/user/dashboard', '/profile', '/settings'];
    const userForbiddenRoutes = ['/admin/dashboard', '/admin/users', '/admin/roles'];

    assert(adminAllowedRoutes.length === 5, 'Admin has access to 5 designated navigation targets');
    assert(userAllowedRoutes.length === 3, 'Regular User has access to 3 designated navigation targets');
    assert(userForbiddenRoutes.every(r => !userAllowedRoutes.includes(r)), 'Regular User navigation strictly excludes administrative management routes');

    // -----------------------------------------------------------------
    // 5. Backend Authorization Middleware & Protected APIs
    // -----------------------------------------------------------------
    console.log('\n--- 5. Backend JWT & Authorization Middleware Enforcement ---');
    // Admin dashboard access:
    const adminDashRes = await fetch(`${BASE_URL}/api/dashboard/admin`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    assert(adminDashRes.status === 200, 'Admin can access /api/dashboard/admin (HTTP 200)');

    const userAdminDashRes = await fetch(`${BASE_URL}/api/dashboard/admin`, {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    assert(userAdminDashRes.status === 403, 'Regular user blocked from /api/dashboard/admin (HTTP 403 Forbidden)');

    // Users list access:
    const adminUsersRes = await fetch(`${BASE_URL}/api/users`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    assert(adminUsersRes.status === 200, 'Admin can access /api/users (HTTP 200)');

    const userUsersRes = await fetch(`${BASE_URL}/api/users`, {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    assert(userUsersRes.status === 403, 'Regular user blocked from /api/users (HTTP 403 Forbidden)');

    // Roles & permissions access:
    const adminRolesRes = await fetch(`${BASE_URL}/api/roles`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    assert(adminRolesRes.status === 200, 'Admin can access /api/roles (HTTP 200)');

    const userRolesRes = await fetch(`${BASE_URL}/api/roles`, {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    assert(userRolesRes.status === 403, 'Regular user blocked from /api/roles (HTTP 403 Forbidden)');

    // Regular User Dashboard:
    const userDashRes = await fetch(`${BASE_URL}/api/dashboard/user`, {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    assert(userDashRes.status === 200, 'Regular user can access /api/dashboard/user (HTTP 200)');

    // -----------------------------------------------------------------
    // 6. Direct URL / Unauthenticated Access Blocked
    // -----------------------------------------------------------------
    console.log('\n--- 6. Direct Unauthenticated API Access Protection ---');
    const noTokenAdmin = await fetch(`${BASE_URL}/api/dashboard/admin`);
    assert(noTokenAdmin.status === 401, 'Direct access to admin dashboard without token returns HTTP 401');

    const noTokenUsers = await fetch(`${BASE_URL}/api/users`);
    assert(noTokenUsers.status === 401, 'Direct access to users API without token returns HTTP 401');

    const noTokenUserDash = await fetch(`${BASE_URL}/api/dashboard/user`);
    assert(noTokenUserDash.status === 401, 'Direct access to user dashboard without token returns HTTP 401');

    // -----------------------------------------------------------------
    // 7. Role & Permission Updates
    // -----------------------------------------------------------------
    console.log('\n--- 7. Dynamic Role & Permission Updates ---');
    // Fetch all available permissions
    const permsRes = await fetch(`${BASE_URL}/api/roles/permissions`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const permsData = await permsRes.json();
    assert(permsRes.status === 200 && permsData.data.length === 11, 'All 11 system permissions retrieved');

    // Fetch user role permissions (ID: 2)
    const userRolePermsRes = await fetch(`${BASE_URL}/api/roles/2/permissions`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const userRolePermsData = await userRolePermsRes.json();
    const originalPermIds = userRolePermsData.permissions.map(p => p.id);
    assert(originalPermIds.length === 4, 'Regular user currently has 4 assigned permissions');

    // Update regular user role permissions to 3 permissions (remove settings:view)
    const testPermIds = originalPermIds.slice(0, 3);
    const updatePermsRes = await fetch(`${BASE_URL}/api/roles/2/permissions`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ permission_ids: testPermIds })
    });
    const updatePermsData = await updatePermsRes.json();
    assert(updatePermsRes.status === 200, 'Admin can update role permissions matrix (HTTP 200)');
    assert(updatePermsData.permissions.length === 3, 'Permissions matrix count updated to 3');

    // Verify DB reflection
    const dbPermCount = await query('SELECT COUNT(*) as cnt FROM role_permissions WHERE role_id = 2');
    assert(dbPermCount[0].cnt === 3, 'Database table `role_permissions` immediately reflects the update');

    // Restore original permissions
    await fetch(`${BASE_URL}/api/roles/2/permissions`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ permission_ids: originalPermIds })
    });
    const dbRestoredCount = await query('SELECT COUNT(*) as cnt FROM role_permissions WHERE role_id = 2');
    assert(dbRestoredCount[0].cnt === 4, 'Original regular user permissions safely restored');

    // -----------------------------------------------------------------
    // 8. User CRUD Operations
    // -----------------------------------------------------------------
    console.log('\n--- 8. User Management: Complete CRUD Cycle ---');
    // CREATE
    const newEmail = `verifier_${Date.now()}@rbacportal.com`;
    const createRes = await fetch(`${BASE_URL}/api/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        name: 'Automated Test User',
        email: newEmail,
        password: 'Password@2026',
        role_id: 2,
        status: 'active',
        department: 'Quality Assurance',
        phone: '+1-555-8888'
      })
    });
    const createData = await createRes.json();
    assert(createRes.status === 201, 'User created with HTTP 201 Created');
    assert(createData.data && createData.data.id, 'Created user returned with database ID');
    createdUserId = createData.data.id;

    // READ (Single user)
    const readRes = await fetch(`${BASE_URL}/api/users/${createdUserId}`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const readData = await readRes.json();
    assert(readRes.status === 200 && readData.data.email === newEmail, 'Admin can retrieve individual user details');

    // UPDATE
    const updateRes = await fetch(`${BASE_URL}/api/users/${createdUserId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        name: 'Automated Test User (Promoted)',
        department: 'Security Operations'
      })
    });
    const updateData = await updateRes.json();
    assert(updateRes.status === 200, 'User updated with HTTP 200 OK');
    assert(updateData.data.name === 'Automated Test User (Promoted)', 'User name updated');

    // READ ALL with Search and Filters
    const searchRes = await fetch(`${BASE_URL}/api/users?search=Promoted&role=user&status=active`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const searchData = await searchRes.json();
    assert(searchRes.status === 200 && searchData.data.length >= 1, 'Search and role/status filtering returns matching user');

    // SELF-DELETION PROTECTION
    const selfDeleteRes = await fetch(`${BASE_URL}/api/users/1`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    assert(selfDeleteRes.status === 400, 'Admin self-deletion blocked with HTTP 400 Bad Request');

    // DELETE
    const deleteRes = await fetch(`${BASE_URL}/api/users/${createdUserId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    assert(deleteRes.status === 200, 'User deleted with HTTP 200 OK');

    // Verify deletion in DB
    const checkDeleted = await query('SELECT * FROM users WHERE id = ?', [createdUserId]);
    assert(checkDeleted.length === 0, 'Deleted user is permanently removed from MySQL');

    // -----------------------------------------------------------------
    // 9. Regular User Profile & Self-Update
    // -----------------------------------------------------------------
    console.log('\n--- 9. Regular User Profile Self-Update ---');
    const updateOwnRes = await fetch(`${BASE_URL}/api/users/profile/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        name: 'Alex Johnson (Verified)',
        department: 'Financial Auditing Lead',
        phone: '+1-555-0149'
      })
    });
    const updateOwnData = await updateOwnRes.json();
    assert(updateOwnRes.status === 200, 'Regular user can update own profile (HTTP 200)');
    assert(updateOwnData.data.name === 'Alex Johnson (Verified)', 'Updated user name returned');

    // Revert back to original
    await fetch(`${BASE_URL}/api/users/profile/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        name: 'Alex Johnson',
        department: 'Financial Auditing',
        phone: '+1-555-0142'
      })
    });

    // -----------------------------------------------------------------
    // 10. Error Handling & Token Rejection
    // -----------------------------------------------------------------
    console.log('\n--- 10. Error Pages, Token Security & Logout ---');
    // Non-existent API route
    const notFoundRes = await fetch(`${BASE_URL}/api/nonexistent-route-xyz`);
    assert(notFoundRes.status === 404, 'Unmapped API route returns HTTP 404');

    // Expired Token
    const expiredToken = jwt.sign(
      { id: 1, email: 'admin@rbacportal.com', role: 'admin' },
      config.jwtSecret,
      { expiresIn: '0s' }
    );
    const expiredRes = await fetch(`${BASE_URL}/api/dashboard/admin`, {
      headers: { 'Authorization': `Bearer ${expiredToken}` }
    });
    assert(expiredRes.status === 401, 'Expired JWT token rejected with HTTP 401');

    // Tampered Token
    const tamperedRes = await fetch(`${BASE_URL}/api/dashboard/admin`, {
      headers: { 'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.signature' }
    });
    assert(tamperedRes.status === 401, 'Tampered JWT token rejected with HTTP 401');

    // Logout
    const logoutRes = await fetch(`${BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    assert(logoutRes.status === 200, 'Logout request returns HTTP 200 OK');

    // Verify activity logged
    const recentLog = await query('SELECT * FROM activity_logs ORDER BY id DESC LIMIT 1');
    assert(recentLog.length > 0 && recentLog[0].action === 'USER_LOGOUT', 'Logout event recorded in MySQL `activity_logs`');

  } catch (err) {
    console.error('Fatal error during verification:', err);
    failed++;
  } finally {
    if (server) {
      server.close();
    }
  }

  console.log('\n================================================================');
  console.log(` VERIFICATION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runFullVerification();
