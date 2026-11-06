<template>
  <div class="app-root">
    <!-- Global Toast Notifications -->
    <ToastContainer />

    <!-- Unauthenticated / Login layout -->
    <template v-if="isGuestLayout">
      <router-view />
    </template>

    <!-- Authenticated App Layout (Sidebar + Top Navbar + Content) -->
    <template v-else>
      <div class="app-container">
        <AppSidebar />
        <div class="main-content-wrapper">
          <AppNavbar />
          <main class="main-content">
            <router-view />
          </main>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from './store/auth';
import ToastContainer from './components/ToastContainer.vue';
import AppSidebar from './components/AppSidebar.vue';
import AppNavbar from './components/AppNavbar.vue';

const route = useRoute();
const auth = useAuthStore();

const isGuestLayout = computed(() => {
  return route.name === 'Login' || !auth.isAuthenticated.value;
});
</script>

<style>
.app-root {
  min-height: 100vh;
}
</style>

