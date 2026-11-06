<template>
  <div class="forbidden-page">
    <div class="forbidden-card card">
      <div class="forbidden-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
        </svg>
      </div>

      <div class="error-badge">HTTP 403 &bull; ACCESS FORBIDDEN</div>
      <h2 class="error-title">Restricted Administrative Resource</h2>
      <p class="error-message">
        You do not possess the required security privileges or assigned role to view this page.
      </p>

      <div class="role-details-box">
        <div class="detail-row">
          <span class="detail-label">Current Role:</span>
          <span class="badge" :class="auth.isAdmin.value ? 'badge-admin' : 'badge-user'">
            {{ auth.user.value?.role_display || (auth.isAdmin.value ? 'Administrator' : 'Regular User') }}
          </span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Required Role:</span>
          <span class="badge badge-admin">Administrator (admin)</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Security Policy:</span>
          <span class="policy-text">RBAC Rule #RBAC-04-ADMIN-ONLY</span>
        </div>
      </div>

      <div class="forbidden-actions">
        <button class="btn btn-primary" @click="goToDashboard">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          Return to My Dashboard
        </button>
        <button class="btn btn-secondary" @click="handleSignOut">
          Sign In as Different User
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store/auth';

const router = useRouter();
const auth = useAuthStore();

const goToDashboard = () => {
  if (auth.isAdmin.value) {
    router.push('/admin/dashboard');
  } else {
    router.push('/user/dashboard');
  }
};

const handleSignOut = () => {
  auth.clearAuth();
  router.push('/login');
};
</script>

<style scoped>
.forbidden-page {
  min-height: calc(100vh - var(--topbar-height) - 4rem);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.forbidden-card {
  max-width: 520px;
  width: 100%;
  padding: 3rem 2.5rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: var(--shadow-xl);
}

.forbidden-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: var(--danger-50);
  color: var(--danger-500);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.error-badge {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--danger-500);
  letter-spacing: 0.08em;
  margin-bottom: 0.5rem;
}

.error-title {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--slate-900);
  line-height: 1.25;
}

.error-message {
  font-size: 0.925rem;
  color: var(--slate-600);
  margin-top: 0.75rem;
  line-height: 1.5;
}

.role-details-box {
  width: 100%;
  background-color: var(--slate-50);
  border: 1px solid var(--slate-200);
  border-radius: var(--radius-md);
  padding: 1.25rem;
  margin: 1.75rem 0;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  text-align: left;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-label {
  font-size: 0.8rem;
  color: var(--slate-500);
  font-weight: 500;
}

.policy-text {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--slate-700);
}

.forbidden-actions {
  display: flex;
  gap: 0.75rem;
  width: 100%;
}

.forbidden-actions .btn {
  flex: 1;
}

@media (max-width: 640px) {
  .forbidden-actions {
    flex-direction: column;
  }
}
</style>

