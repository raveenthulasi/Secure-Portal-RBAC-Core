<template>
  <div class="admin-dashboard">
    <!-- Header Banner -->
    <div class="dashboard-header-banner card">
      <div class="banner-content">
        <div class="banner-badge">
          <span class="status-indicator"></span>
          <span>Security Perimeter Operational</span>
        </div>
        <h2 class="banner-title">Welcome back, {{ auth.user.value?.name }}</h2>
        <p class="banner-subtitle">
          Administrative control center with full privileged access to users, roles, and granular security policies.
        </p>
      </div>
      <div class="banner-actions">
        <router-link to="/admin/users" class="btn btn-primary">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
          Manage Users
        </router-link>
        <router-link to="/admin/roles" class="btn btn-secondary">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="m9 16 2 2 4-4"/></svg>
          Roles &amp; Permissions
        </router-link>
      </div>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="loading" class="loading-state">
      <div class="spinner-large"></div>
      <p>Loading enterprise analytics and security statistics...</p>
    </div>

    <div v-else>
      <!-- Metric Cards Grid -->
      <div class="grid-cols-4 stats-grid">
        <StatCard
          title="Total Users"
          :value="metrics.totalUsers"
          subtitle="Registered accounts"
          icon-bg-class="icon-primary"
        >
          <template #icon>
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </template>
        </StatCard>

        <StatCard
          title="Active Users"
          :value="metrics.activeUsers"
          subtitle="Currently active & verified"
          icon-bg-class="icon-success"
        >
          <template #icon>
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </template>
        </StatCard>

        <StatCard
          title="Inactive Accounts"
          :value="metrics.inactiveUsers"
          subtitle="Deactivated / Suspended"
          icon-bg-class="icon-warning"
        >
          <template #icon>
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
          </template>
        </StatCard>

        <StatCard
          title="Security Roles"
          :value="metrics.totalRoles"
          :subtitle="`${metrics.totalPermissions} active permissions`"
          icon-bg-class="icon-purple"
        >
          <template #icon>
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="m9 16 2 2 4-4"/></svg>
          </template>
        </StatCard>
      </div>

      <!-- Main Panels Grid -->
      <div class="grid-cols-2 main-panels">
        <!-- Recent Registered Users -->
        <div class="card panel-card">
          <div class="card-header">
            <div>
              <h3 class="card-title">Recent Registered Users</h3>
              <p class="card-subtitle">Latest accounts provisioned on the portal</p>
            </div>
            <router-link to="/admin/users" class="btn btn-ghost btn-sm">
              View All &rarr;
            </router-link>
          </div>
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="user in recentUsers" :key="user.id">
                    <td>
                      <div class="table-user-cell">
                        <div class="user-avatar-sm">
                          {{ getInitials(user.name) }}
                        </div>
                        <div>
                          <div class="table-name">{{ user.name }}</div>
                          <div class="table-sub">{{ user.email }}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span :class="['badge', user.role_name === 'admin' ? 'badge-admin' : 'badge-user']">
                        {{ user.role_display_name || user.role_name }}
                      </span>
                    </td>
                    <td>
                      <span :class="['badge', user.status === 'active' ? 'badge-active' : 'badge-inactive']">
                        {{ user.status }}
                      </span>
                    </td>
                    <td class="text-muted">
                      {{ formatDate(user.created_at) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- System Security & Audit Log -->
        <div class="card panel-card">
          <div class="card-header">
            <div>
              <h3 class="card-title">Security &amp; Audit Logs</h3>
              <p class="card-subtitle">Real-time authentication and modification events</p>
            </div>
            <span class="badge badge-active">Live Monitor</span>
          </div>
          <div class="card-body p-0">
            <div class="audit-list">
              <div v-for="log in recentLogs" :key="log.id" class="audit-item">
                <div class="audit-icon-wrap" :class="getAuditIconClass(log.action)">
                  <svg v-if="log.action.includes('LOGIN')" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                  <svg v-else-if="log.action.includes('CREATED')" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                  <svg v-else-if="log.action.includes('DELETED')" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                </div>
                <div class="audit-details">
                  <div class="audit-action-row">
                    <span class="audit-action-name">{{ log.action }}</span>
                    <span class="audit-timestamp">{{ formatDate(log.created_at) }}</span>
                  </div>
                  <p class="audit-description">{{ log.details }}</p>
                  <div class="audit-meta">
                    <span>Target: {{ log.user_email }}</span>
                    <span>&bull;</span>
                    <span>IP: {{ log.ip_address }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../store/auth';
import { dashboardService } from '../services/dashboardService';
import StatCard from '../components/StatCard.vue';

const auth = useAuthStore();
const loading = ref(true);

const metrics = ref({
  totalUsers: 0,
  activeUsers: 0,
  inactiveUsers: 0,
  totalRoles: 0,
  totalPermissions: 0
});

const recentUsers = ref([]);
const recentLogs = ref([]);

const fetchDashboardData = async () => {
  loading.value = true;
  try {
    const res = await dashboardService.getAdminStats();
    if (res.success && res.data) {
      metrics.value = res.data.metrics;
      recentUsers.value = res.data.recentUsers || [];
      recentLogs.value = res.data.recentLogs || [];
    }
  } catch (error) {
    console.error('Failed to load admin stats:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchDashboardData();
});

const getInitials = (name) => {
  if (!name) return 'U';
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const d = new Date(dateString);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getAuditIconClass = (action) => {
  if (action.includes('LOGIN')) return 'audit-icon-blue';
  if (action.includes('CREATED')) return 'audit-icon-green';
  if (action.includes('DELETED')) return 'audit-icon-red';
  return 'audit-icon-purple';
};
</script>

<style scoped>
.admin-dashboard {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.dashboard-header-banner {
  background: linear-gradient(135deg, #1e40af 0%, #2563eb 100%);
  color: #ffffff;
  padding: 2rem 2.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: none;
}

.banner-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.25);
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  backdrop-filter: blur(4px);
}

.status-indicator {
  width: 8px;
  height: 8px;
  background-color: #34d399;
  border-radius: 50%;
  box-shadow: 0 0 0 2px rgba(52, 211, 153, 0.4);
}

.banner-title {
  font-size: 1.65rem;
  font-weight: 800;
  letter-spacing: -0.01em;
}

.banner-subtitle {
  font-size: 0.925rem;
  color: #dbeafe;
  margin-top: 0.35rem;
  max-width: 600px;
}

.banner-actions {
  display: flex;
  gap: 0.85rem;
}

.banner-actions .btn-secondary {
  background: rgba(255, 255, 255, 0.15);
  color: #ffffff;
  border-color: rgba(255, 255, 255, 0.3);
}
.banner-actions .btn-secondary:hover {
  background: rgba(255, 255, 255, 0.25);
}

.stats-grid {
  margin-top: 0.5rem;
}

.main-panels {
  margin-top: 0.5rem;
}

.table-user-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar-sm {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--primary-100);
  color: var(--primary-700);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.75rem;
  flex-shrink: 0;
}

.table-name {
  font-weight: 600;
  color: var(--slate-900);
}

.table-sub {
  font-size: 0.75rem;
  color: var(--slate-400);
}

.text-muted {
  font-size: 0.8125rem;
  color: var(--slate-500);
}

.p-0 {
  padding: 0 !important;
}

/* Audit log list */
.audit-list {
  display: flex;
  flex-direction: column;
}

.audit-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--slate-100);
  transition: background-color var(--transition-fast);
}

.audit-item:hover {
  background-color: var(--slate-50);
}

.audit-icon-wrap {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 0.15rem;
}

.audit-icon-blue {
  background-color: var(--primary-50);
  color: var(--primary-600);
}
.audit-icon-green {
  background-color: var(--success-50);
  color: var(--success-500);
}
.audit-icon-red {
  background-color: var(--danger-50);
  color: var(--danger-500);
}
.audit-icon-purple {
  background-color: #f5f3ff;
  color: #7c3aed;
}

.audit-details {
  flex: 1;
}

.audit-action-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.audit-action-name {
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--slate-800);
  letter-spacing: 0.02em;
}

.audit-timestamp {
  font-size: 0.75rem;
  color: var(--slate-400);
}

.audit-description {
  font-size: 0.825rem;
  color: var(--slate-600);
  margin-top: 0.15rem;
}

.audit-meta {
  font-size: 0.725rem;
  color: var(--slate-400);
  display: flex;
  gap: 0.4rem;
  margin-top: 0.25rem;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: var(--slate-500);
  gap: 1rem;
}

.spinner-large {
  width: 40px;
  height: 40px;
  border: 3px solid var(--slate-200);
  border-top-color: var(--primary-600);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 860px) {
  .dashboard-header-banner {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.5rem;
  }
}
</style>

