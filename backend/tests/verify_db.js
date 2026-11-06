const { pool, query } = require('../config/db');

async function inspectDb() {
  try {
    console.log('--- Inspecting Database Tables & Relationships ---');
    const tables = await query('SHOW TABLES;');
    console.log('Tables Found:', tables.map(t => Object.values(t)[0]));

    for (const t of tables) {
      const tableName = Object.values(t)[0];
      const count = await query(`SELECT COUNT(*) as cnt FROM \`${tableName}\``);
      console.log(`Table [${tableName}]: ${count[0].cnt} rows`);
    }

    console.log('\n--- Roles ---');
    const roles = await query('SELECT id, name, display_name FROM roles');
    console.table(roles);

    console.log('\n--- Permissions Count Per Role ---');
    const rolePerms = await query(`
      SELECT r.name AS role_name, COUNT(rp.permission_id) AS total_permissions
      FROM roles r
      LEFT JOIN role_permissions rp ON r.id = rp.role_id
      GROUP BY r.id
    `);
    console.table(rolePerms);

    console.log('\n--- Registered Users ---');
    const users = await query(`
      SELECT u.id, u.name, u.email, u.status, u.department, r.name AS role
      FROM users u
      JOIN roles r ON u.role_id = r.id
    `);
    console.table(users);

    console.log('\n--- Foreign Key Constraints ---');
    const fks = await query(`
      SELECT TABLE_NAME, COLUMN_NAME, CONSTRAINT_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = 'rbac_portal_db' AND REFERENCED_TABLE_NAME IS NOT NULL
    `);
    console.table(fks);

    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error('Inspection Error:', err);
    process.exit(1);
  }
}

inspectDb();

