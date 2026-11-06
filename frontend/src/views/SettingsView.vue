<template>
  <div class="settings-view">
    <div class="card header-card">
      <div>
        <h2 class="section-title">Portal Preferences &amp; Settings</h2>
        <p class="section-subtitle">
          Configure security session parameters and system preferences
        </p>
      </div>
    </div>

    <div class="grid-cols-2">
      <!-- Session & Authentication Policy -->
      <div class="card">
        <div class="card-header">
          <div>
            <h3 class="card-title">Authentication &amp; Session Policy</h3>
            <p class="card-subtitle">Active security controls for this portal</p>
          </div>
        </div>
        <div class="card-body">
          <div class="settings-item">
            <div class="item-text">
              <span class="item-title">JSON Web Token Lifetime</span>
              <span class="item-desc">Access tokens expire after 24 hours of inactivity.</span>
            </div>
            <span class="badge badge-admin">24 Hours</span>
          </div>

          <div class="settings-item">
            <div class="item-text">
              <span class="item-title">Cryptographic Hash Algorithm</span>
              <span class="item-desc">Salt rounds = 10 (bcrypt-js adaptive work factor).</span>
            </div>
            <span class="badge badge-active">Bcrypt (Cost 10)</span>
          </div>

          <div class="settings-item">
            <div class="item-text">
              <span class="item-title">Cross-Origin Resource Sharing (CORS)</span>
              <span class="item-desc">Protected origins and sanitized request headers.</span>
            </div>
            <span class="badge badge-active">Active</span>
          </div>

          <div class="settings-item">
            <div class="item-text">
              <span class="item-title">Dual-Layer Access Control</span>
              <span class="item-desc">Vue Router Route Guards + Express Middleware.</span>
            </div>
            <span class="badge badge-active">Enforced</span>
          </div>
        </div>
      </div>

      <!-- Environment & Database Info -->
      <div class="card">
        <div class="card-header">
          <div>
            <h3 class="card-title">Environment &amp; Infrastructure</h3>
            <p class="card-subtitle">Underlying database and service architecture</p>
          </div>
        </div>
        <div class="card-body">
          <div class="settings-item">
            <div class="item-text">
              <span class="item-title">Database Engine</span>
              <span class="item-desc">MySQL Community Server with connection pooling.</span>
            </div>
            <span class="badge badge-user">MySQL 8.0</span>
          </div>

          <div class="settings-item">
            <div class="item-text">
              <span class="item-title">Backend Framework</span>
              <span class="item-desc">Node.js Express REST API micro-architecture.</span>
            </div>
            <span class="badge badge-user">Express.js 4</span>
          </div>

          <div class="settings-item">
            <div class="item-text">
              <span class="item-title">Frontend Framework</span>
              <span class="item-desc">Vue.js 3 with Composition API and Vue Router 4.</span>
            </div>
            <span class="badge badge-user">Vue 3.5</span>
          </div>

          <div class="settings-item">
            <div class="item-text">
              <span class="item-title">Portal Mode</span>
              <span class="item-desc">Strict RBAC Model (Roles, Permissions &amp; Junctions).</span>
            </div>
            <span class="badge badge-admin">Production Ready</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '../store/auth';

const auth = useAuthStore();
</script>

<style scoped>
.settings-view {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.header-card {
  padding: 1.5rem 1.75rem;
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

.settings-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 0;
  border-bottom: 1px solid var(--slate-100);
}

.settings-item:last-child {
  border-bottom: none;
}

.item-text {
  display: flex;
  flex-direction: column;
}

.item-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--slate-800);
}

.item-desc {
  font-size: 0.775rem;
  color: var(--slate-500);
  margin-top: 0.15rem;
}
</style>

