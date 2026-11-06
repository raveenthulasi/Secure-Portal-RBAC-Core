<template>
  <div class="users-management">
    <!-- Top Action Bar -->
    <div class="management-header card">
      <div class="header-info">
        <h2 class="section-title">User Account Directory</h2>
        <p class="section-subtitle">
          Manage system users, assign access roles, and control active credentials
        </p>
      </div>
      <div class="header-actions">
        <button class="btn btn-primary" @click="openCreateModal">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add New User
        </button>
      </div>
    </div>

    <!-- Filters & Search Toolbar -->
    <div class="card toolbar-card">
      <div class="search-box">
        <span class="search-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </span>
        <input
          v-model="searchQuery"
          type="text"
          class="form-input search-input"
          placeholder="Search by name, email, or department..."
          @input="onFilterChange"
        />
        <button v-if="searchQuery" class="clear-search" @click="clearSearch">&times;</button>
      </div>

      <div class="filters-group">
        <div class="filter-item">
          <label class="filter-label">Role:</label>
          <select v-model="selectedRole" class="form-select filter-select" @change="onFilterChange">
            <option value="">All Roles</option>
            <option value="admin">Administrator</option>
            <option value="user">Regular User</option>
          </select>
        </div>

        <div class="filter-item">
          <label class="filter-label">Status:</label>
          <select v-model="selectedStatus" class="form-select filter-select" @change="onFilterChange">
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <button class="btn btn-secondary btn-sm" @click="resetFilters" title="Reset Filters">
          Reset
        </button>
      </div>
    </div>

    <!-- Users Table Card -->
    <div class="card table-card">
      <div class="card-header">
        <div class="table-counts">
          <span class="count-label">Showing {{ users.length }} of {{ pagination.total }} users</span>
        </div>
      </div>

      <div class="card-body p-0">
        <div v-if="loading" class="table-loading">
          <div class="spinner"></div>
          <span>Loading user accounts...</span>
        </div>

        <div v-else-if="users.length === 0" class="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="17" y1="8" x2="23" y2="14"/><line x1="23" y1="8" x2="17" y2="14"/></svg>
          <h4>No matching users found</h4>
          <p>Try modifying your search criteria or filter options.</p>
        </div>

        <div v-else class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>User Details</th>
                <th>Role Assignment</th>
                <th>Department</th>
                <th>Status</th>
                <th>Last Login</th>
                <th style="text-align: right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in users" :key="user.id">
                <td>
                  <div class="user-cell">
                    <div class="user-avatar">
                      {{ getInitials(user.name) }}
                    </div>
                    <div>
                      <div class="user-name">
                        {{ user.name }}
                        <span v-if="user.id === auth.user.value?.id" class="self-tag">(You)</span>
                      </div>
                      <div class="user-email">{{ user.email }}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span :class="['badge', user.role_name === 'admin' ? 'badge-admin' : 'badge-user']">
                    {{ user.role_display_name || user.role_name }}
                  </span>
                </td>
                <td>
                  <span class="dept-text">{{ user.department || 'General' }}</span>
                </td>
                <td>
                  <span :class="['badge', user.status === 'active' ? 'badge-active' : 'badge-inactive']">
                    {{ user.status }}
                  </span>
                </td>
                <td>
                  <span class="date-text">{{ formatDate(user.last_login) }}</span>
                </td>
                <td>
                  <div class="action-buttons">
                    <button
                      class="action-btn edit-btn"
                      title="Edit User"
                      @click="openEditModal(user)"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
                    </button>

                    <button
                      class="action-btn delete-btn"
                      :title="user.id === auth.user.value?.id ? 'Cannot delete your own account' : 'Delete User'"
                      :disabled="user.id === auth.user.value?.id"
                      @click="confirmDeleteUser(user)"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pagination Footer -->
      <div v-if="pagination.totalPages > 1" class="card-footer pagination-footer">
        <span class="pagination-info">
          Page {{ pagination.page }} of {{ pagination.totalPages }}
        </span>
        <div class="pagination-controls">
          <button
            class="btn btn-secondary btn-sm"
            :disabled="pagination.page <= 1"
            @click="changePage(pagination.page - 1)"
          >
            Previous
          </button>
          <button
            class="btn btn-secondary btn-sm"
            :disabled="pagination.page >= pagination.totalPages"
            @click="changePage(pagination.page + 1)"
          >
            Next
          </button>
        </div>
      </div>
    </div>

    <!-- User Modal (Create / Edit) -->
    <UserModal
      :is-open="isUserModalOpen"
      :is-edit="isEditMode"
      :user-data="selectedUser"
      :roles="roles"
      :loading="savingUser"
      @save="handleSaveUser"
      @close="isUserModalOpen = false"
    />

    <!-- Delete Confirmation Modal -->
    <ConfirmationModal
      :is-open="isDeleteModalOpen"
      title="Delete User Account"
      :message="`Are you sure you want to permanently delete '${userToDelete?.name}' (${userToDelete?.email})? This action cannot be undone.`"
      confirm-text="Delete User"
      type="danger"
      :loading="deletingUser"
      @confirm="handleDeleteUser"
      @cancel="isDeleteModalOpen = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../store/auth';
import { useToast } from '../store/toast';
import { userService } from '../services/userService';
import { roleService } from '../services/roleService';
import UserModal from '../components/UserModal.vue';
import ConfirmationModal from '../components/ConfirmationModal.vue';

const auth = useAuthStore();
const toast = useToast();

const loading = ref(true);
const users = ref([]);
const roles = ref([]);
const searchQuery = ref('');
const selectedRole = ref('');
const selectedStatus = ref('');

const pagination = ref({
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 1
});

// Modals State
const isUserModalOpen = ref(false);
const isEditMode = ref(false);
const selectedUser = ref(null);
const savingUser = ref(false);

const isDeleteModalOpen = ref(false);
const userToDelete = ref(null);
const deletingUser = ref(false);

const fetchRoles = async () => {
  try {
    const res = await roleService.getRoles();
    if (res.success) {
      roles.value = res.data;
    }
  } catch (err) {
    console.error('Failed to fetch roles:', err);
  }
};

const fetchUsers = async () => {
  loading.value = true;
  try {
    const res = await userService.getUsers({
      search: searchQuery.value,
      role: selectedRole.value,
      status: selectedStatus.value,
      page: pagination.value.page,
      limit: pagination.value.limit
    });

    if (res.success) {
      users.value = res.data;
      pagination.value = res.pagination;
    }
  } catch (err) {
    toast.error(err.response?.data?.message || 'Failed to fetch users');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchRoles();
  fetchUsers();
});

let searchTimeout = null;
const onFilterChange = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    pagination.value.page = 1;
    fetchUsers();
  }, 300);
};

const clearSearch = () => {
  searchQuery.value = '';
  onFilterChange();
};

const resetFilters = () => {
  searchQuery.value = '';
  selectedRole.value = '';
  selectedStatus.value = '';
  pagination.value.page = 1;
  fetchUsers();
};

const changePage = (newPage) => {
  pagination.value.page = newPage;
  fetchUsers();
};

// Open Modals
const openCreateModal = () => {
  isEditMode.value = false;
  selectedUser.value = null;
  isUserModalOpen.value = true;
};

const openEditModal = (user) => {
  isEditMode.value = true;
  selectedUser.value = user;
  isUserModalOpen.value = true;
};

const handleSaveUser = async (formData) => {
  savingUser.value = true;
  try {
    if (isEditMode.value && selectedUser.value) {
      await userService.updateUser(selectedUser.value.id, formData);
      toast.success(`User '${formData.name}' updated successfully.`);
    } else {
      await userService.createUser(formData);
      toast.success(`User '${formData.name}' created successfully.`);
    }
    isUserModalOpen.value = false;
    fetchUsers();
  } catch (err) {
    toast.error(err.response?.data?.message || 'Operation failed.');
  } finally {
    savingUser.value = false;
  }
};

const confirmDeleteUser = (user) => {
  if (user.id === auth.user.value?.id) {
    toast.warning('You cannot delete your own account.');
    return;
  }
  userToDelete.value = user;
  isDeleteModalOpen.value = true;
};

const handleDeleteUser = async () => {
  if (!userToDelete.value) return;
  deletingUser.value = true;
  try {
    await userService.deleteUser(userToDelete.value.id);
    toast.success(`User '${userToDelete.value.name}' deleted successfully.`);
    isDeleteModalOpen.value = false;
    fetchUsers();
  } catch (err) {
    toast.error(err.response?.data?.message || 'Failed to delete user.');
  } finally {
    deletingUser.value = false;
  }
};

const getInitials = (name) => {
  if (!name) return 'U';
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

const formatDate = (dateString) => {
  if (!dateString) return 'Never';
  const d = new Date(dateString);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};
</script>

<style scoped>
.users-management {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.management-header {
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

.toolbar-card {
  padding: 1rem 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 280px;
}

.search-icon {
  position: absolute;
  left: 0.85rem;
  color: var(--slate-400);
  display: flex;
  align-items: center;
}

.search-input {
  padding-left: 2.5rem;
  padding-right: 2rem;
}

.clear-search {
  position: absolute;
  right: 0.75rem;
  font-size: 1.25rem;
  color: var(--slate-400);
  cursor: pointer;
}

.filters-group {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.filter-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--slate-600);
}

.filter-select {
  padding: 0.45rem 0.75rem;
  font-size: 0.8125rem;
  width: auto;
}

.table-card {
  overflow: hidden;
}

.table-counts .count-label {
  font-size: 0.85rem;
  color: var(--slate-500);
  font-weight: 500;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--primary-100);
  color: var(--primary-700);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.8125rem;
  flex-shrink: 0;
}

.user-name {
  font-weight: 600;
  color: var(--slate-900);
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.self-tag {
  font-size: 0.7rem;
  color: var(--primary-600);
  font-weight: 500;
}

.user-email {
  font-size: 0.775rem;
  color: var(--slate-400);
}

.dept-text {
  font-size: 0.85rem;
  color: var(--slate-700);
}

.date-text {
  font-size: 0.8rem;
  color: var(--slate-500);
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.action-btn {
  padding: 0.45rem;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}

.edit-btn {
  color: var(--slate-600);
  background-color: var(--slate-100);
}
.edit-btn:hover {
  background-color: var(--primary-50);
  color: var(--primary-600);
}

.delete-btn {
  color: var(--danger-500);
  background-color: var(--danger-50);
}
.delete-btn:hover:not(:disabled) {
  background-color: #fee2e2;
  color: var(--danger-700);
}
.delete-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pagination-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.pagination-info {
  font-size: 0.85rem;
  color: var(--slate-500);
}

.pagination-controls {
  display: flex;
  gap: 0.5rem;
}

.table-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 3rem;
  color: var(--slate-500);
  font-size: 0.875rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  color: var(--slate-400);
}

.empty-state h4 {
  font-size: 1.1rem;
  color: var(--slate-700);
  margin-top: 1rem;
}

.empty-state p {
  font-size: 0.85rem;
  color: var(--slate-500);
  margin-top: 0.25rem;
}

.p-0 {
  padding: 0 !important;
}

@media (max-width: 640px) {
  .management-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  .toolbar-card {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>

