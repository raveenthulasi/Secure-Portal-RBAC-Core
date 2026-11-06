<template>
  <div class="roles-permissions-view">
    <!-- Header Banner -->
    <div class="card header-card">
      <div>
        <h2 class="section-title">Roles &amp; Permissions Matrix</h2>
        <p class="section-subtitle">
          Configure security policy boundaries and assign granular privileges to roles
        </p>
      </div>
      <div class="header-badges">
        <span class="badge badge-admin">{{ roles.length }} Roles Defined</span>
        <span class="badge badge-active">{{ permissions.length }} Permissions Active</span>
      </div>
    </div>

    <!-- Roles Grid Cards -->
    <div class="grid-cols-2 roles-cards">
      <div
        v-for="role in roles"
        :key="role.id"
        :class="['card', 'role-card', { 'role-card-active': selectedRole?.id === role.id }]"
        @click="selectRole(role)"
      >
        <div class="role-card-header">
          <div class="role-title-box">
            <span :class="['badge', role.name === 'admin' ? 'badge-admin' : 'badge-user']">
              {{ role.name.toUpperCase() }}
            </span>
            <h3 class="role-display-name">{{ role.display_name }}</h3>
          </div>
          <div class="role-users-count">
            <span class="count-num">{{ role.user_count || 0 }}</span>
            <span class="count-text">Users</span>
          </div>
        </div>

        <p class="role-desc">{{ role.description }}</p>

        <div class="role-card-footer">
          <span class="perm-count">
            <strong>{{ getPermissionCountForRole(role.id) }}</strong> assigned permissions
          </span>
          <button
            class="btn btn-sm"
            :class="selectedRole?.id === role.id ? 'btn-primary' : 'btn-secondary'"
          >
            {{ selectedRole?.id === role.id ? 'Selected' : 'Configure' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Permissions Matrix for Selected Role -->
    <div v-if="selectedRole" class="card matrix-card">
      <div class="card-header matrix-header">
        <div>
          <h3 class="card-title">
            Configure Permissions for <span class="highlight-role">{{ selectedRole.display_name }}</span>
          </h3>
          <p class="card-subtitle">
            Toggle permissions granted to accounts with the '{{ selectedRole.name }}' role
          </p>
        </div>
        <div class="matrix-actions">
          <button
            v-if="selectedRole.name !== 'admin'"
            class="btn btn-secondary btn-sm"
            @click="selectAllPermissions"
          >
            Select All
          </button>
          <button
            v-if="selectedRole.name !== 'admin'"
            class="btn btn-secondary btn-sm"
            @click="clearAllPermissions"
          >
            Deselect All
          </button>
          <button
            class="btn btn-primary"
            :disabled="saving"
            @click="saveRolePermissions"
          >
            <span v-if="saving">Updating Matrix...</span>
            <span v-else>Save Permission Policy</span>
          </button>
        </div>
      </div>

      <div class="card-body">
        <div v-if="selectedRole.name === 'admin'" class="admin-notice">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
          <div>
            <strong>Administrator Master Privilege</strong>
            <p>The Administrator role maintains unrestricted superuser access to all system endpoints and modules.</p>
          </div>
        </div>

        <!-- Modules Grid -->
        <div class="modules-grid">
          <div
            v-for="(perms, moduleName) in groupedPermissions"
            :key="moduleName"
            class="module-group card"
          >
            <div class="module-group-header">
              <span class="module-title">{{ formatModuleName(moduleName) }}</span>
              <span class="module-badge">{{ perms.length }} rules</span>
            </div>

            <div class="module-permissions-list">
              <label
                v-for="perm in perms"
                :key="perm.id"
                class="perm-checkbox-item"
              >
                <input
                  type="checkbox"
                  :value="perm.id"
                  v-model="selectedPermissionIds"
                  :disabled="selectedRole.name === 'admin'"
                />
                <div class="perm-info">
                  <span class="perm-name">{{ perm.display_name }}</span>
                  <span class="perm-key">{{ perm.name }}</span>
                  <span class="perm-desc">{{ perm.description }}</span>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { roleService } from '../services/roleService';
import { useToast } from '../store/toast';

const toast = useToast();

const loading = ref(true);
const saving = ref(false);
const roles = ref([]);
const permissions = ref([]);
const selectedRole = ref(null);
const selectedPermissionIds = ref([]);
const rolePermissionsMap = ref({});

const fetchAll = async () => {
  loading.value = true;
  try {
    const [rolesRes, permsRes] = await Promise.all([
      roleService.getRoles(),
      roleService.getPermissions()
    ]);

    if (rolesRes.success) {
      roles.value = rolesRes.data;
    }
    if (permsRes.success) {
      permissions.value = permsRes.data;
    }

    // Fetch permissions for all roles
    for (const r of roles.value) {
      const rpRes = await roleService.getRolePermissions(r.id);
      if (rpRes.success) {
        rolePermissionsMap.value[r.id] = rpRes.permissions.map(p => p.id);
      }
    }

    if (roles.value.length > 0) {
      selectRole(roles.value[0]);
    }
  } catch (err) {
    toast.error('Failed to load roles and permissions data.');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchAll();
});

const selectRole = (role) => {
  selectedRole.value = role;
  selectedPermissionIds.value = [...(rolePermissionsMap.value[role.id] || [])];
};

const getPermissionCountForRole = (roleId) => {
  return rolePermissionsMap.value[roleId]?.length || 0;
};

const groupedPermissions = computed(() => {
  const groups = {};
  permissions.value.forEach(p => {
    if (!groups[p.module]) {
      groups[p.module] = [];
    }
    groups[p.module].push(p);
  });
  return groups;
});

const formatModuleName = (name) => {
  return name.charAt(0).toUpperCase() + name.slice(1) + ' Module';
};

const selectAllPermissions = () => {
  selectedPermissionIds.value = permissions.value.map(p => p.id);
};

const clearAllPermissions = () => {
  selectedPermissionIds.value = [];
};

const saveRolePermissions = async () => {
  if (!selectedRole.value) return;
  saving.value = true;
  try {
    await roleService.updateRolePermissions(selectedRole.value.id, selectedPermissionIds.value);
    rolePermissionsMap.value[selectedRole.value.id] = [...selectedPermissionIds.value];
    toast.success(`Permissions for role '${selectedRole.value.display_name}' saved successfully!`);
  } catch (err) {
    toast.error(err.response?.data?.message || 'Failed to update permissions.');
  } finally {
    saving.value = false;
  }
};
</script>

<style scoped>
.roles-permissions-view {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.header-card {
  padding: 1.5rem 1.75rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-title {
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--slate-900);
}

.section-subtitle {
  font-size: 0.85rem;
  color: var(--slate-500);
  margin-top: 0.2rem;
}

.header-badges {
  display: flex;
  gap: 0.5rem;
}

.roles-cards {
  gap: 1.25rem;
}

.role-card {
  padding: 1.5rem;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all var(--transition-fast);
}

.role-card:hover {
  border-color: var(--primary-300);
}

.role-card-active {
  border-color: var(--primary-600);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.15);
  background: #f8faff;
}

.role-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.role-display-name {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--slate-900);
  margin-top: 0.4rem;
}

.role-users-count {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: var(--slate-100);
  padding: 0.35rem 0.75rem;
  border-radius: var(--radius-md);
}

.count-num {
  font-weight: 700;
  font-size: 1.1rem;
  color: var(--slate-800);
  line-height: 1;
}

.count-text {
  font-size: 0.65rem;
  color: var(--slate-500);
  text-transform: uppercase;
}

.role-desc {
  font-size: 0.825rem;
  color: var(--slate-600);
  margin: 1rem 0;
  min-height: 40px;
}

.role-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid var(--slate-100);
}

.perm-count {
  font-size: 0.8rem;
  color: var(--slate-500);
}

.matrix-card {
  margin-top: 0.5rem;
}

.matrix-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.highlight-role {
  color: var(--primary-600);
}

.matrix-actions {
  display: flex;
  gap: 0.5rem;
}

.admin-notice {
  background-color: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: var(--radius-md);
  padding: 1rem 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.85rem;
  margin-bottom: 1.5rem;
  color: #1e40af;
  font-size: 0.85rem;
}

.admin-notice svg {
  flex-shrink: 0;
}

.modules-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.25rem;
}

.module-group {
  padding: 1.25rem;
  background: var(--slate-50);
  border: 1px solid var(--slate-200);
}

.module-group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--slate-200);
}

.module-title {
  font-weight: 700;
  font-size: 0.95rem;
  color: var(--slate-800);
}

.module-badge {
  font-size: 0.7rem;
  background: var(--slate-200);
  color: var(--slate-700);
  padding: 0.15rem 0.5rem;
  border-radius: var(--radius-full);
  font-weight: 600;
}

.module-permissions-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.perm-checkbox-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  background: #ffffff;
  padding: 0.75rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--slate-200);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.perm-checkbox-item:hover {
  border-color: var(--primary-400);
}

.perm-checkbox-item input[type="checkbox"] {
  width: 18px;
  height: 18px;
  margin-top: 0.15rem;
  accent-color: var(--primary-600);
  cursor: pointer;
}

.perm-info {
  display: flex;
  flex-direction: column;
}

.perm-name {
  font-weight: 600;
  font-size: 0.825rem;
  color: var(--slate-900);
}

.perm-key {
  font-family: var(--font-mono);
  font-size: 0.725rem;
  color: var(--primary-600);
  margin-top: 0.1rem;
}

.perm-desc {
  font-size: 0.75rem;
  color: var(--slate-500);
  margin-top: 0.2rem;
}

@media (max-width: 860px) {
  .modules-grid {
    grid-template-columns: 1fr;
  }
}
</style>

