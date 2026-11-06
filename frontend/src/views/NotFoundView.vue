<template>
  <div class="notfound-page">
    <div class="notfound-card card">
      <div class="notfound-code">404</div>
      <h2 class="notfound-title">Page Not Found</h2>
      <p class="notfound-desc">
        The requested URL path does not exist on this portal or has been moved to another location.
      </p>
      <button class="btn btn-primary" @click="handleGoHome">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        Return to Portal
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store/auth';

const router = useRouter();
const auth = useAuthStore();

const handleGoHome = () => {
  if (auth.isAuthenticated.value) {
    if (auth.isAdmin.value) {
      router.push('/admin/dashboard');
    } else {
      router.push('/user/dashboard');
    }
  } else {
    router.push('/login');
  }
};
</script>

<style scoped>
.notfound-page {
  min-height: calc(100vh - var(--topbar-height) - 4rem);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.notfound-card {
  max-width: 480px;
  width: 100%;
  padding: 3rem 2.5rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.notfound-code {
  font-size: 5rem;
  font-weight: 900;
  color: var(--primary-600);
  line-height: 1;
  letter-spacing: -0.04em;
}

.notfound-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--slate-900);
  margin-top: 1rem;
}

.notfound-desc {
  font-size: 0.9rem;
  color: var(--slate-500);
  margin: 0.75rem 0 2rem;
  line-height: 1.5;
}
</style>

