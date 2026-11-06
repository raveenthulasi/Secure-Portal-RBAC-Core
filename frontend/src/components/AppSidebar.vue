<template>
  <aside :class="['sidebar', { 'sidebar-collapsed': isCollapsed }]">
    <!-- Brand / Header -->
    <div class="sidebar-header">
      <div class="brand-wrapper">
        <div class="brand-logo">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        </div>
        <div v-if="!isCollapsed" class="brand-text">
          <span class="brand-title">Secure Portal</span>
          <span class="brand-badge">RBAC Core</span>
        </div>
      </div>
      <button class="toggle-btn" @click="toggleCollapse" title="Toggle Navigation">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline :points="isCollapsed ? '9 18 15 12 9 6' : '15 18 9 12 15 6'"></polyline>
        </svg>
      </button>
    </div>

    <!-- User Role Tag -->
    <div v-if="!isCollapsed && auth.user.value" class="sidebar-role-card">
      <div class="role-icon">
        <span class="pulse-dot"></span>
      </div>
      <div class="role-info">
        <span class="role-label">Current Role</span>
        <span class="role-name">{{ auth.user.value.role_display || (auth.isAdmin.value ? 'Administrator' : 'Regular User') }}</span>
      </div>
    </div>

    <!-- Navigation Menu Items -->
    <nav class="sidebar-nav">
      <div class="nav-section-title" v-if="!isCollapsed">MAIN MENU</div>
      <ul class="nav-list">
        <li v-for="item in navItems" :key="item.path" class="nav-item">
          <router-link
            :to="item.path"
            class="nav-link"
            :active-class="'active'"
            :title="isCollapsed ? item.label : ''"
          >
            <div class="nav-icon" v-html="item.icon"></div>
            <span v-if="!isCollapsed" class="nav-label">{{ item.label }}</span>
            <span v-if="!isCollapsed && item.badge" class="nav-item-badge">{{ item.badge }}</span>
          </router-link>
        </li>
      </ul>

      <div class="nav-section-title" v-if="!isCollapsed">ACCOUNT</div>
      <ul class="nav-list">
        <li class="nav-item">
          <router-link
            to="/profile"
            class="nav-link"
            :active-class="'active'"
            :title="isCollapsed ? 'Profile' : ''"
          >
            <div class="nav-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <span v-if="!isCollapsed" class="nav-label">{{ auth.isAdmin.value ? 'Profile' : 'My Profile' }}</span>
          </router-link>
        </li>
        <li class="nav-item">
          <router-link
            to="/settings"
            class="nav-link"
            :active-class="'active'"
            :title="isCollapsed ? 'Settings' : ''"
          >
            <div class="nav-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
            </div>
            <span v-if="!isCollapsed" class="nav-label">Settings</span>
          </router-link>
        </li>
      </ul>
    </nav>

    <!-- User Profile & Logout Footer -->
    <div class="sidebar-footer">
      <div v-if="!isCollapsed && auth.user.value" class="user-mini-profile">
        <div class="avatar-circle">
          {{ userInitials }}
        </div>
        <div class="user-details">
          <span class="user-name" :title="auth.user.value.name">{{ auth.user.value.name }}</span>
          <span class="user-email" :title="auth.user.value.email">{{ auth.user.value.email }}</span>
        </div>
      </div>
      <button class="logout-action-btn" @click="handleLogout" :title="isCollapsed ? 'Logout' : ''">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        <span v-if="!isCollapsed">Logout</span>
      </button>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store/auth';
import { useToast } from '../store/toast';
import { authService } from '../services/authService';

const auth = useAuthStore();
const router = useRouter();
const toast = useToast();

const isCollapsed = ref(false);

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value;
};

const userInitials = computed(() => {
  if (!auth.user.value?.name) return 'U';
  return auth.user.value.name
    .split(' ')
    .map(p => p[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
});

// Dynamic navigation list according to role and permissions
const navItems = computed(() => {
  if (auth.isAdmin.value) {
    return [
      {
        path: '/admin/dashboard',
        label: 'Dashboard',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>'
      },
      {
        path: '/admin/users',
        label: 'Manage Users',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>'
      },
      {
        path: '/admin/roles',
        label: 'Roles & Permissions',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="m9 16 2 2 4-4"/></svg>'
      }
    ];
  } else {
    return [
      {
        path: '/user/dashboard',
        label: 'Dashboard',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>'
      }
    ];
  }
});

const handleLogout = async () => {
  await authService.logout();
  auth.clearAuth();
  toast.info('You have been logged out successfully.');
  router.push('/login');
};
</script>

<style scoped>
.sidebar {
  width: var(--sidebar-width);
  min-height: 100vh;
  background-color: #0f172a;
  color: #f8fafc;
  display: flex;
  flex-direction: column;
  transition: width var(--transition-normal);
  position: relative;
  border-right: 1px solid #1e293b;
  flex-shrink: 0;
  z-index: 50;
}

.sidebar-collapsed {
  width: var(--sidebar-collapsed-width);
}

.sidebar-header {
  height: var(--topbar-height);
  padding: 0 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.brand-wrapper {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  overflow: hidden;
}

.brand-logo {
  width: 38px;
  height: 38px;
  border-radius: var(--radius-md);
  background: linear-gradient(135deg, #2563eb, #1e40af);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 10px rgba(37, 99, 235, 0.35);
}

.brand-text {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}

.brand-title {
  font-weight: 700;
  font-size: 0.95rem;
  letter-spacing: -0.01em;
  color: #ffffff;
}

.brand-badge {
  font-size: 0.65rem;
  text-transform: uppercase;
  color: #94a3b8;
  letter-spacing: 0.05em;
  font-weight: 600;
}

.toggle-btn {
  color: #94a3b8;
  padding: 0.4rem;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}

.toggle-btn:hover {
  color: #ffffff;
  background-color: rgba(255, 255, 255, 0.1);
}

.sidebar-role-card {
  margin: 1rem 1rem 0.5rem;
  padding: 0.75rem 0.9rem;
  background: rgba(30, 41, 59, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.role-icon {
  display: flex;
  align-items: center;
}

.pulse-dot {
  width: 8px;
  height: 8px;
  background-color: #10b981;
  border-radius: 50%;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.25);
}

.role-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.role-label {
  font-size: 0.6875rem;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.role-name {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #f1f5f9;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar-nav {
  flex: 1;
  padding: 1rem 0.75rem;
  overflow-y: auto;
}

.nav-section-title {
  font-size: 0.65rem;
  font-weight: 700;
  color: #64748b;
  letter-spacing: 0.08em;
  padding: 0.75rem 0.75rem 0.35rem;
}

.nav-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-bottom: 0.75rem;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem 0.85rem;
  border-radius: var(--radius-md);
  color: #94a3b8;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all var(--transition-fast);
  position: relative;
}

.nav-link:hover {
  color: #ffffff;
  background-color: rgba(255, 255, 255, 0.06);
}

.nav-link.active {
  color: #ffffff;
  background-color: #2563eb;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

.nav-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.nav-label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar-footer {
  padding: 1rem 0.75rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(15, 23, 42, 0.6);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.user-mini-profile {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.25rem 0.5rem;
}

.avatar-circle {
  width: 34px;
  height: 34px;
  background: #3b82f6;
  color: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.8125rem;
  flex-shrink: 0;
}

.user-details {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.user-name {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #f8fafc;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-email {
  font-size: 0.6875rem;
  color: #94a3b8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.logout-action-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.6rem 0.85rem;
  border-radius: var(--radius-md);
  color: #ef4444;
  font-size: 0.875rem;
  font-weight: 500;
  background: rgba(239, 68, 68, 0.08);
  transition: all var(--transition-fast);
}

.logout-action-btn:hover {
  background: rgba(239, 68, 68, 0.18);
  color: #f87171;
}

.sidebar-collapsed .sidebar-header {
  justify-content: center;
  padding: 0;
}
.sidebar-collapsed .toggle-btn {
  display: none;
}
.sidebar-collapsed .nav-link {
  justify-content: center;
  padding: 0.75rem;
}
.sidebar-collapsed .logout-action-btn {
  justify-content: center;
  padding: 0.75rem;
}
</style>

