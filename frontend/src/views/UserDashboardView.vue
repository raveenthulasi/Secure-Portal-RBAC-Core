<template>
  <div class="user-dashboard">
    <!-- User Welcome Card -->
    <div class="card user-welcome-card">
      <div class="welcome-left">
        <div class="user-avatar-lg">
          {{ userInitials }}
        </div>
        <div class="welcome-text">
          <div class="role-pill">
            <span class="role-dot"></span>
            <span>Regular User Portal</span>
          </div>
          <h2 class="welcome-name">Hello, {{ auth.user.value?.name }}</h2>
          <p class="welcome-meta">
            {{ auth.user.value?.email }} &bull; Department: {{ auth.user.value?.department || 'General' }}
          </p>
        </div>
      </div>
      <div class="welcome-actions">
        <router-link to="/profile" class="btn btn-primary">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          Edit Profile
        </router-link>
        <router-link to="/settings" class="btn btn-secondary">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
          Security Settings
        </router-link>
      </div>
    </div>

    <!-- Quick Stats Grid -->
    <div class="grid-cols-3">
      <StatCard
        title="Role Privilege Level"
        value="Standard"
        subtitle="Assigned: Regular User"
        icon-bg-class="icon-primary"
      >
        <template #icon>
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        </template>
      </StatCard>

      <StatCard
        title="Account Status"
        value="Active"
        subtitle="Authenticated via Bearer JWT"
        icon-bg-class="icon-success"
      >
        <template #icon>
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        </template>
      </StatCard>

      <StatCard
        title="Active Permissions"
        :value="assignedPermissions.length"
        subtitle="Scoped to personal workspace"
        icon-bg-class="icon-purple"
      >
        <template #icon>
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="m9 16 2 2 4-4"/></svg>
        </template>
      </StatCard>
    </div>

    <!-- Main Content Grid -->
    <div class="grid-cols-2">
      <!-- Permitted Information & Role Capabilities -->
      <div class="card">
        <div class="card-header">
          <div>
            <h3 class="card-title">Permitted Information &amp; Scope</h3>
            <p class="card-subtitle">Features and resources granted to your role</p>
          </div>
          <span class="badge badge-active">Authorized</span>
        </div>
        <div class="card-body">
          <div class="capabilities-list">
            <div class="cap-item cap-allowed">
              <div class="cap-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <div class="cap-text">
                <div class="cap-title">Personal Dashboard (dashboard:user)</div>
                <div class="cap-desc">Access personal overview, metrics, and permitted user tools.</div>
              </div>
            </div>

            <div class="cap-item cap-allowed">
              <div class="cap-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <div class="cap-text">
                <div class="cap-title">Profile Management (profile:read, profile:update)</div>
                <div class="cap-desc">Inspect personal details and update phone, name, and department.</div>
              </div>
            </div>

            <div class="cap-item cap-allowed">
              <div class="cap-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <div class="cap-text">
                <div class="cap-title">Security Settings (settings:view)</div>
                <div class="cap-desc">Update personal password and adjust personal portal preferences.</div>
              </div>
            </div>

            <div class="cap-divider"></div>

            <!-- Blocked Capabilities -->
            <div class="cap-item cap-denied">
              <div class="cap-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
              </div>
              <div class="cap-text">
                <div class="cap-title">Admin Dashboard &amp; Privileged APIs</div>
                <div class="cap-desc">Blocked by Route Guard and Node.js Authorization Middleware.</div>
              </div>
            </div>

            <div class="cap-item cap-denied">
              <div class="cap-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
              </div>
              <div class="cap-text">
                <div class="cap-title">User &amp; Role Management</div>
                <div class="cap-desc">Creating, editing, deleting other accounts is strictly restricted to Administrators.</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Account Security Status -->
      <div class="card">
        <div class="card-header">
          <div>
            <h3 class="card-title">Account Security Checklist</h3>
            <p class="card-subtitle">Protection measures for your portal session</p>
          </div>
        </div>
        <div class="card-body">
          <div class="security-checklist">
            <div class="check-row">
              <div class="check-info">
                <span class="check-title">Session Authentication</span>
                <span class="check-desc">Authenticated via signed Bearer JWT</span>
              </div>
              <span class="badge badge-active">Protected</span>
            </div>

            <div class="check-row">
              <div class="check-info">
                <span class="check-title">Password Cryptography</span>
                <span class="check-desc">Stored as salted bcrypt hash</span>
              </div>
              <span class="badge badge-active">Encrypted</span>
            </div>

            <div class="check-row">
              <div class="check-info">
                <span class="check-title">Access Policy Verification</span>
                <span class="check-desc">Every API request verified on server-side</span>
              </div>
              <span class="badge badge-active">Enforced</span>
            </div>

            <div class="check-row">
              <div class="check-info">
                <span class="check-title">Account Status</span>
                <span class="check-desc">Current state: active</span>
              </div>
              <span class="badge badge-active">Active</span>
            </div>
          </div>

          <div class="security-box">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            <p>
              To change your password or update your contact phone and department, visit your
              <router-link to="/profile">Profile page</router-link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useAuthStore } from '../store/auth';
import StatCard from '../components/StatCard.vue';

const auth = useAuthStore();

const userInitials = computed(() => {
  if (!auth.user.value?.name) return 'U';
  return auth.user.value.name
    .split(' ')
    .map(p => p[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
});

const assignedPermissions = computed(() => {
  return auth.user.value?.permissions || [];
});
</script>

<style scoped>
.user-dashboard {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.user-welcome-card {
  padding: 2rem 2.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #ffffff;
}

.welcome-left {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.user-avatar-lg {
  width: 68px;
  height: 68px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2563eb, #1e40af);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  box-shadow: 0 8px 16px rgba(37, 99, 235, 0.25);
  flex-shrink: 0;
}

.welcome-text {
  display: flex;
  flex-direction: column;
}

.role-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: var(--primary-50);
  color: var(--primary-700);
  padding: 0.2rem 0.65rem;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 700;
  width: fit-content;
  margin-bottom: 0.35rem;
}

.role-dot {
  width: 6px;
  height: 6px;
  background-color: var(--primary-600);
  border-radius: 50%;
}

.welcome-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--slate-900);
}

.welcome-meta {
  font-size: 0.875rem;
  color: var(--slate-500);
  margin-top: 0.2rem;
}

.welcome-actions {
  display: flex;
  gap: 0.75rem;
}

.capabilities-list {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.cap-item {
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
  padding: 0.75rem;
  border-radius: var(--radius-md);
}

.cap-allowed {
  background-color: var(--slate-50);
}
.cap-allowed .cap-icon {
  color: var(--success-500);
  margin-top: 0.15rem;
}

.cap-denied {
  background-color: #fef2f2;
}
.cap-denied .cap-icon {
  color: var(--danger-500);
  margin-top: 0.15rem;
}

.cap-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--slate-800);
}

.cap-desc {
  font-size: 0.8rem;
  color: var(--slate-500);
  margin-top: 0.15rem;
}

.cap-divider {
  height: 1px;
  background-color: var(--slate-200);
  margin: 0.25rem 0;
}

.security-checklist {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.check-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--slate-100);
}

.check-info {
  display: flex;
  flex-direction: column;
}

.check-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--slate-800);
}

.check-desc {
  font-size: 0.775rem;
  color: var(--slate-500);
}

.security-box {
  margin-top: 1.5rem;
  background-color: var(--primary-50);
  border: 1px solid var(--primary-200);
  border-radius: var(--radius-md);
  padding: 1rem;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  font-size: 0.825rem;
  color: var(--primary-900);
}

.security-box svg {
  color: var(--primary-600);
  flex-shrink: 0;
  margin-top: 0.1rem;
}

@media (max-width: 860px) {
  .user-welcome-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.5rem;
  }
}
</style>

