<template>
  <header class="top-navbar">
    <div class="navbar-left">
      <div class="page-meta">
        <h1 class="page-title">{{ currentRouteTitle }}</h1>
        <div class="security-chip">
          <span class="security-dot"></span>
          <span>Role Guard: Active</span>
        </div>
      </div>
    </div>

    <div class="navbar-right">
      <!-- Quick Test Accounts Switcher Hint / Dropdown -->
      <div class="account-badge">
        <span class="badge-role" :class="auth.isAdmin.value ? 'badge-admin' : 'badge-user'">
          {{ auth.isAdmin.value ? 'ADMIN ACCESS' : 'USER ACCESS' }}
        </span>
      </div>

      <!-- User Dropdown Menu -->
      <div class="user-dropdown-container">
        <button class="profile-trigger" @click="isDropdownOpen = !isDropdownOpen">
          <div class="user-avatar-sm">
            {{ userInitials }}
          </div>
          <span class="dropdown-user-name">{{ auth.user.value?.name }}</span>
          <svg class="chevron-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>

        <div v-if="isDropdownOpen" class="dropdown-menu" @click="isDropdownOpen = false">
          <div class="dropdown-header">
            <span class="dropdown-signed-in">Signed in as</span>
            <strong class="dropdown-email">{{ auth.user.value?.email }}</strong>
            <span class="dropdown-department">{{ auth.user.value?.department || 'General' }}</span>
          </div>
          <div class="dropdown-divider"></div>
          <router-link to="/profile" class="dropdown-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            My Profile
          </router-link>
          <router-link to="/settings" class="dropdown-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
            Account Settings
          </router-link>
          <div class="dropdown-divider"></div>
          <button class="dropdown-item text-danger" @click="handleLogout">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Sign Out
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../store/auth';
import { useToast } from '../store/toast';
import { authService } from '../services/authService';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const toast = useToast();

const isDropdownOpen = ref(false);

const currentRouteTitle = computed(() => {
  return route.meta?.title || 'Overview';
});

const userInitials = computed(() => {
  if (!auth.user.value?.name) return 'U';
  return auth.user.value.name
    .split(' ')
    .map(p => p[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
});

const handleLogout = async () => {
  await authService.logout();
  auth.clearAuth();
  toast.info('Logged out of session.');
  router.push('/login');
};

const closeOnOutsideClick = (e) => {
  if (!e.target.closest('.user-dropdown-container')) {
    isDropdownOpen.value = false;
  }
};

onMounted(() => {
  window.addEventListener('click', closeOnOutsideClick);
});

onUnmounted(() => {
  window.removeEventListener('click', closeOnOutsideClick);
});
</script>

<style scoped>
.top-navbar {
  height: var(--topbar-height);
  background: #ffffff;
  border-bottom: 1px solid var(--slate-200);
  padding: 0 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 40;
}

.navbar-left {
  display: flex;
  align-items: center;
}

.page-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.page-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--slate-900);
}

.security-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.2rem 0.6rem;
  background-color: var(--slate-100);
  border: 1px solid var(--slate-200);
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--slate-600);
}

.security-dot {
  width: 6px;
  height: 6px;
  background-color: #10b981;
  border-radius: 50%;
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.account-badge .badge-role {
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.user-dropdown-container {
  position: relative;
}

.profile-trigger {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.35rem 0.6rem;
  border-radius: var(--radius-md);
  transition: background-color var(--transition-fast);
}

.profile-trigger:hover {
  background-color: var(--slate-100);
}

.user-avatar-sm {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #2563eb;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.8125rem;
}

.dropdown-user-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--slate-800);
}

.chevron-icon {
  color: var(--slate-400);
}

.dropdown-menu {
  position: absolute;
  right: 0;
  top: calc(100% + 0.5rem);
  width: 240px;
  background: #ffffff;
  border: 1px solid var(--slate-200);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  padding: 0.5rem 0;
  display: flex;
  flex-direction: column;
  z-index: 100;
  animation: fadeIn 0.15s ease-out;
}

.dropdown-header {
  padding: 0.75rem 1rem;
  display: flex;
  flex-direction: column;
}

.dropdown-signed-in {
  font-size: 0.75rem;
  color: var(--slate-400);
}

.dropdown-email {
  font-size: 0.875rem;
  color: var(--slate-800);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dropdown-department {
  font-size: 0.75rem;
  color: var(--primary-600);
  margin-top: 0.15rem;
}

.dropdown-divider {
  height: 1px;
  background: var(--slate-100);
  margin: 0.4rem 0;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.6rem 1rem;
  color: var(--slate-700);
  font-size: 0.875rem;
  transition: all var(--transition-fast);
  cursor: pointer;
  border: none;
  background: transparent;
  width: 100%;
  text-align: left;
}

.dropdown-item:hover {
  background-color: var(--slate-50);
  color: var(--primary-600);
}

.dropdown-item.text-danger {
  color: var(--danger-500);
}

.dropdown-item.text-danger:hover {
  background-color: var(--danger-50);
  color: var(--danger-700);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-6px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 640px) {
  .top-navbar {
    padding: 0 1rem;
  }
  .dropdown-user-name {
    display: none;
  }
}
</style>

