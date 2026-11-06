const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const config = require('../config/config');

async function initializeDatabase() {
  console.log('--- Initializing RBAC Portal Database ---');
  let connection;
  try {
    // 1. Connect without database to ensure database exists
    connection = await mysql.createConnection({
      host: config.db.host,
      port: config.db.port,
      user: config.db.user,
      password: config.db.password
    });

    console.log(`Creating database ${config.db.database} if not exists...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${config.db.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await connection.query(`USE \`${config.db.database}\`;`);

    // 2. Create tables
    console.log('Creating tables...');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`roles\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`name\` VARCHAR(50) NOT NULL UNIQUE,
        \`display_name\` VARCHAR(100) NOT NULL,
        \`description\` VARCHAR(255) NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`permissions\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`name\` VARCHAR(100) NOT NULL UNIQUE,
        \`display_name\` VARCHAR(100) NOT NULL,
        \`module\` VARCHAR(50) NOT NULL,
        \`description\` VARCHAR(255) NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`role_permissions\` (
        \`role_id\` INT NOT NULL,
        \`permission_id\` INT NOT NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`role_id\`, \`permission_id\`),
        CONSTRAINT \`fk_rp_role\` FOREIGN KEY (\`role_id\`) REFERENCES \`roles\` (\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`fk_rp_permission\` FOREIGN KEY (\`permission_id\`) REFERENCES \`permissions\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`users\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`role_id\` INT NOT NULL,
        \`name\` VARCHAR(100) NOT NULL,
        \`email\` VARCHAR(150) NOT NULL UNIQUE,
        \`password\` VARCHAR(255) NOT NULL,
        \`status\` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
        \`phone\` VARCHAR(30) NULL,
        \`department\` VARCHAR(100) DEFAULT 'General',
        \`avatar\` VARCHAR(255) NULL,
        \`last_login\` TIMESTAMP NULL DEFAULT NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT \`fk_users_role\` FOREIGN KEY (\`role_id\`) REFERENCES \`roles\` (\`id\`) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`activity_logs\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`user_id\` INT NULL,
        \`user_email\` VARCHAR(150) NULL,
        \`action\` VARCHAR(100) NOT NULL,
        \`details\` TEXT NULL,
        \`ip_address\` VARCHAR(60) NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT \`fk_logs_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 3. Seed Roles
    console.log('Seeding roles...');
    const roles = [
      { name: 'admin', display_name: 'Administrator', description: 'Full administrative access to manage users, roles, permissions, and security configurations.' },
      { name: 'user', display_name: 'Regular User', description: 'Standard user access restricted to own profile, personal dashboard, and designated features.' }
    ];

    for (const role of roles) {
      await connection.query(`
        INSERT INTO \`roles\` (\`name\`, \`display_name\`, \`description\`)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE \`display_name\` = VALUES(\`display_name\`), \`description\` = VALUES(\`description\`);
      `, [role.name, role.display_name, role.description]);
    }

    // 4. Seed Permissions
    console.log('Seeding permissions...');
    const permissions = [
      { name: 'dashboard:admin', display_name: 'View Admin Dashboard', module: 'dashboard', description: 'Access administrative statistical overview and metrics.' },
      { name: 'dashboard:user', display_name: 'View User Dashboard', module: 'dashboard', description: 'Access personal overview and permitted user metrics.' },
      { name: 'users:read', display_name: 'View Users', module: 'users', description: 'Browse and search all registered user accounts.' },
      { name: 'users:create', display_name: 'Create User', module: 'users', description: 'Register and onboard new user accounts.' },
      { name: 'users:update', display_name: 'Update User', module: 'users', description: 'Modify details, roles, and status of users.' },
      { name: 'users:delete', display_name: 'Delete User', module: 'users', description: 'Remove user accounts from the portal.' },
      { name: 'roles:read', display_name: 'View Roles', module: 'roles', description: 'Inspect available roles and their permission assignments.' },
      { name: 'roles:manage', display_name: 'Manage Roles & Permissions', module: 'roles', description: 'Configure role permission matrices.' },
      { name: 'profile:read', display_name: 'View Profile', module: 'profile', description: 'Access own account information and status.' },
      { name: 'profile:update', display_name: 'Update Profile', module: 'profile', description: 'Update own contact information and password.' },
      { name: 'settings:view', display_name: 'Access Settings', module: 'settings', description: 'View and adjust personal portal preferences.' }
    ];

    for (const perm of permissions) {
      await connection.query(`
        INSERT INTO \`permissions\` (\`name\`, \`display_name\`, \`module\`, \`description\`)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE \`display_name\` = VALUES(\`display_name\`), \`module\` = VALUES(\`module\`), \`description\` = VALUES(\`description\`);
      `, [perm.name, perm.display_name, perm.module, perm.description]);
    }

    // 5. Assign Permissions to Roles
    console.log('Assigning permissions to roles...');
    // Get role IDs
    const [roleRows] = await connection.query('SELECT id, name FROM `roles`');
    const roleMap = {};
    roleRows.forEach(r => { roleMap[r.name] = r.id; });

    // Get permission IDs
    const [permRows] = await connection.query('SELECT id, name FROM `permissions`');
    const permMap = {};
    permRows.forEach(p => { permMap[p.name] = p.id; });

    // Clear existing assignments to re-sync
    await connection.query('DELETE FROM `role_permissions`');

    // Admin gets all permissions
    const adminRoleID = roleMap['admin'];
    for (const perm of permRows) {
      await connection.query('INSERT IGNORE INTO `role_permissions` (role_id, permission_id) VALUES (?, ?)', [adminRoleID, perm.id]);
    }

    // Regular User gets personal permissions
    const userRoleID = roleMap['user'];
    const userPermNames = ['dashboard:user', 'profile:read', 'profile:update', 'settings:view'];
    for (const name of userPermNames) {
      if (permMap[name]) {
        await connection.query('INSERT IGNORE INTO `role_permissions` (role_id, permission_id) VALUES (?, ?)', [userRoleID, permMap[name]]);
      }
    }

    // 6. Seed Users
    console.log('Seeding initial users...');
    const saltRounds = 10;
    const adminPasswordHash = await bcrypt.hash('Admin@123', saltRounds);
    const userPasswordHash = await bcrypt.hash('User@123', saltRounds);

    const seedUsers = [
      {
        role_id: adminRoleID,
        name: 'System Administrator',
        email: 'admin@rbacportal.com',
        password: adminPasswordHash,
        status: 'active',
        phone: '+1-555-0199',
        department: 'IT & Security Infrastructure'
      },
      {
        role_id: userRoleID,
        name: 'Alex Johnson',
        email: 'user@rbacportal.com',
        password: userPasswordHash,
        status: 'active',
        phone: '+1-555-0142',
        department: 'Financial Auditing'
      },
      {
        role_id: userRoleID,
        name: 'Jane Doe',
        email: 'jane.doe@rbacportal.com',
        password: userPasswordHash,
        status: 'active',
        phone: '+1-555-0188',
        department: 'People Operations'
      },
      {
        role_id: userRoleID,
        name: 'Robert Miller',
        email: 'inactive.user@rbacportal.com',
        password: userPasswordHash,
        status: 'inactive',
        phone: '+1-555-0112',
        department: 'Marketing Strategy'
      }
    ];

    for (const u of seedUsers) {
      await connection.query(`
        INSERT INTO \`users\` (\`role_id\`, \`name\`, \`email\`, \`password\`, \`status\`, \`phone\`, \`department\`)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
          \`role_id\` = VALUES(\`role_id\`),
          \`name\` = VALUES(\`name\`),
          \`password\` = VALUES(\`password\`),
          \`status\` = VALUES(\`status\`),
          \`phone\` = VALUES(\`phone\`),
          \`department\` = VALUES(\`department\`);
      `, [u.role_id, u.name, u.email, u.password, u.status, u.phone, u.department]);
    }

    // 7. Seed Initial Activity Log
    await connection.query(`
      INSERT INTO \`activity_logs\` (\`user_email\`, \`action\`, \`details\`, \`ip_address\`)
      VALUES ('system', 'SYSTEM_INITIALIZATION', 'RBAC Portal Database initialized and seeded with default roles and users.', '127.0.0.1');
    `);

    console.log('✓ Database initialization completed successfully!');
    console.log('Sample Accounts created:');
    console.log('  Admin User : admin@rbacportal.com / Admin@123');
    console.log('  Reg User 1 : user@rbacportal.com  / User@123');
    console.log('  Reg User 2 : jane.doe@rbacportal.com / User@123');
    console.log('  Inactive   : inactive.user@rbacportal.com / User@123');
  } catch (err) {
    console.error('Database initialization failed:', err);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

initializeDatabase();

