const app = require('../server');
const config = require('../config/config');
const { testConnection } = require('../config/db');
const jwt = require('jsonwebtoken');

let server;
const BASE_URL = `http://127.0.0.1:5055`;

async function runTests() {
  console.log('==================================================');
  console.log(' Starting RBAC Portal Automated Integration Tests');
  console.log('==================================================\n');

  await testConnection();
  
  // Start temporary test server on port 5055
  await new Promise((resolve) => {
    server = app.listen(5055, () => {
      console.log('Test server listening on port 5055\n');
      resolve();
    });
  });

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, details = '') {
    if (condition) {
      console.log(`  ✓ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${testName} - ${details}`);
      failed++;
    }
  }

  let adminToken = '';
  let userToken = '';
  let createdUserId = null;

  try {
    // ----------------------------------------------------
    // Scenario 1: Admin can log in and access Admin Dashboard
    // ----------------------------------------------------
    console.log('[Scenario 1] Admin Authentication & Admin Dashboard Access');
    const adminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@rbacportal.com', password: 'Admin@123' })
    });
    const adminLoginData = await adminLoginRes.json();
    assert(adminLoginRes.status === 200, 'Admin login HTTP 200', `Status: ${adminLoginRes.status}`);
    assert(adminLoginData.token && adminLoginData.user.role === 'admin', 'Admin token received and role is admin');
    adminToken = adminLoginData.token;

    const adminDashRes = await fetch(`${BASE_URL}/api/dashboard/admin`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const adminDashData = await adminDashRes.json();
    assert(adminDashRes.status === 200, 'Admin access to /api/dashboard/admin HTTP 200');
    assert(adminDashData.data && adminDashData.data.metrics.totalUsers >= 4, 'Admin dashboard metrics retrieved');

    // ----------------------------------------------------
    // Scenario 2: Regular User can log in and access User Dashboard
    // ----------------------------------------------------
    console.log('\n[Scenario 2] Regular User Authentication & User Dashboard Access');
    const userLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'user@rbacportal.com', password: 'User@123' })
    });
    const userLoginData = await userLoginRes.json();
    assert(userLoginRes.status === 200, 'User login HTTP 200', `Status: ${userLoginRes.status}`);
    assert(userLoginData.token && userLoginData.user.role === 'user', 'User token received and role is user');
    userToken = userLoginData.token;

    const userDashRes = await fetch(`${BASE_URL}/api/dashboard/user`, {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    const userDashData = await userDashRes.json();
    assert(userDashRes.status === 200, 'User access to /api/dashboard/user HTTP 200');
    assert(userDashData.data && userDashData.data.profile.email === 'user@rbacportal.com', 'User personal dashboard profile loaded');

    // ----------------------------------------------------
    // Scenario 3: Admin User Management (Create, View, Update, Delete)
    // ----------------------------------------------------
    console.log('\n[Scenario 3] Admin User Management Operations');
    // List users
    const listRes = await fetch(`${BASE_URL}/api/users`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const listData = await listRes.json();
    assert(listRes.status === 200 && Array.isArray(listData.data), 'Admin can list registered users');

    // Create a new user
    const uniqueEmail = `testuser_${Date.now()}@example.com`;
    const createRes = await fetch(`${BASE_URL}/api/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        name: 'Test Candidate',
        email: uniqueEmail,
        password: 'Password@123',
        role_id: 2, // Regular user role
        status: 'active',
        department: 'Engineering',
        phone: '+1-555-9999'
      })
    });
    const createData = await createRes.json();
    assert(createRes.status === 201 && createData.data.id, 'Admin can create new user');
    createdUserId = createData.data.id;

    // Update user
    const updateRes = await fetch(`${BASE_URL}/api/users/${createdUserId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        name: 'Test Candidate Updated',
        department: 'Platform Architecture'
      })
    });
    const updateData = await updateRes.json();
    assert(updateRes.status === 200 && updateData.data.name === 'Test Candidate Updated', 'Admin can update user details');

    // Delete user
    const deleteRes = await fetch(`${BASE_URL}/api/users/${createdUserId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    assert(deleteRes.status === 200, 'Admin can delete user');

    // ----------------------------------------------------
    // Scenario 4: Regular User CANNOT access Admin endpoints (HTTP 403)
    // ----------------------------------------------------
    console.log('\n[Scenario 4] Regular User Access Forbidden on Admin APIs');
    const userAdminDashRes = await fetch(`${BASE_URL}/api/dashboard/admin`, {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    assert(userAdminDashRes.status === 403, 'User blocked from /api/dashboard/admin with HTTP 403');

    const userUsersListRes = await fetch(`${BASE_URL}/api/users`, {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    assert(userUsersListRes.status === 403, 'User blocked from /api/users with HTTP 403');

    const userRolesRes = await fetch(`${BASE_URL}/api/roles`, {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    assert(userRolesRes.status === 403, 'User blocked from /api/roles with HTTP 403');

    // ----------------------------------------------------
    // Scenario 5: Direct API / Protected access without token blocked (HTTP 401)
    // ----------------------------------------------------
    console.log('\n[Scenario 5] Unauthenticated Access Blocked (HTTP 401)');
    const noTokenRes = await fetch(`${BASE_URL}/api/dashboard/admin`);
    assert(noTokenRes.status === 401, 'No token request returns HTTP 401');

    const noTokenUserDash = await fetch(`${BASE_URL}/api/dashboard/user`);
    assert(noTokenUserDash.status === 401, 'No token user dashboard returns HTTP 401');

    // ----------------------------------------------------
    // Scenario 6: Unauthorized API requests return HTTP 403
    // ----------------------------------------------------
    console.log('\n[Scenario 6] Unauthorized Modification Rejected (HTTP 403)');
    const unauthorizedCreateRes = await fetch(`${BASE_URL}/api/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        name: 'Hacker User',
        email: 'hacker@example.com',
        password: 'Password@123',
        role_id: 1
      })
    });
    assert(unauthorizedCreateRes.status === 403, 'Regular user cannot create users (HTTP 403)');

    // ----------------------------------------------------
    // Scenario 7: Invalid Login returns appropriate error (HTTP 401)
    // ----------------------------------------------------
    console.log('\n[Scenario 7] Invalid Login Error Handling');
    const badLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@rbacportal.com', password: 'WrongPassword999!' })
    });
    const badLoginData = await badLoginRes.json();
    assert(badLoginRes.status === 401, 'Wrong password returns HTTP 401');
    assert(badLoginData.message.includes('Invalid'), 'Error message informs user of invalid credentials');

    const nonexistentUserRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nonexistent@rbacportal.com', password: 'Password@123' })
    });
    assert(nonexistentUserRes.status === 401, 'Nonexistent email returns HTTP 401');

    // ----------------------------------------------------
    // Scenario 8: Expired or Tampered JWT tokens rejected (HTTP 401)
    // ----------------------------------------------------
    console.log('\n[Scenario 8] Expired / Tampered JWT Token Rejection');
    const expiredToken = jwt.sign(
      { id: 1, email: 'admin@rbacportal.com', role: 'admin' },
      config.jwtSecret,
      { expiresIn: '0s' } // Expired immediately
    );
    const expiredRes = await fetch(`${BASE_URL}/api/dashboard/admin`, {
      headers: { 'Authorization': `Bearer ${expiredToken}` }
    });
    const expiredData = await expiredRes.json();
    assert(expiredRes.status === 401, 'Expired token returns HTTP 401');
    assert(expiredData.message.toLowerCase().includes('expired'), 'Error message specifies token expiration');

    const tamperedRes = await fetch(`${BASE_URL}/api/dashboard/admin`, {
      headers: { 'Authorization': 'Bearer fake.invalid.jwt.token' }
    });
    assert(tamperedRes.status === 401, 'Tampered token returns HTTP 401');

    // ----------------------------------------------------
    // Scenario 9: Logout clears authenticated session
    // ----------------------------------------------------
    console.log('\n[Scenario 9] Logout Handling');
    const logoutRes = await fetch(`${BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    const logoutData = await logoutRes.json();
    assert(logoutRes.status === 200, 'Logout endpoint returns HTTP 200');
    assert(logoutData.success === true, 'Logout reported success');

  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  } finally {
    if (server) {
      server.close();
    }
  }

  console.log('\n==================================================');
  console.log(` Test Results: ${passed} Passed, ${failed} Failed`);
  console.log('==================================================');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests();
