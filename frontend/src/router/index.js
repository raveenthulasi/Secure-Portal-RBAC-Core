import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../store/auth';

const routes = [
  {
    path: '/',
    redirect: () => {
      const auth = useAuthStore();
      if (!auth.isAuthenticated.value) return '/login';
      return auth.isAdmin.value ? '/admin/dashboard' : '/user/dashboard';
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
    meta: { guestOnly: true }
  },
  {
    path: '/admin/dashboard',
    name: 'AdminDashboard',
    component: () => import('../views/AdminDashboardView.vue'),
    meta: {
      requiresAuth: true,
      roles: ['admin'],
      permission: 'dashboard:admin',
      title: 'Admin Dashboard'
    }
  },
  {
    path: '/admin/users',
    name: 'UsersManagement',
    component: () => import('../views/UsersManagementView.vue'),
    meta: {
      requiresAuth: true,
      roles: ['admin'],
      permission: 'users:read',
      title: 'User Management'
    }
  },
  {
    path: '/admin/roles',
    name: 'RolesPermissions',
    component: () => import('../views/RolesPermissionsView.vue'),
    meta: {
      requiresAuth: true,
      roles: ['admin'],
      permission: 'roles:read',
      title: 'Roles & Permissions'
    }
  },
  {
    path: '/user/dashboard',
    name: 'UserDashboard',
    component: () => import('../views/UserDashboardView.vue'),
    meta: {
      requiresAuth: true,
      roles: ['user', 'admin'],
      permission: 'dashboard:user',
      title: 'User Dashboard'
    }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/ProfileView.vue'),
    meta: {
      requiresAuth: true,
      permission: 'profile:read',
      title: 'My Profile'
    }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../views/SettingsView.vue'),
    meta: {
      requiresAuth: true,
      permission: 'settings:view',
      title: 'Settings'
    }
  },
  {
    path: '/403',
    name: 'Forbidden',
    component: () => import('../views/ForbiddenView.vue'),
    meta: { title: '403 - Forbidden' }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFoundView.vue'),
    meta: { title: '404 - Page Not Found' }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Navigation Guards
router.beforeEach(async (to, from, next) => {
  const auth = useAuthStore();

  // If token exists but user not loaded, wait for init
  if (auth.token.value && !auth.user.value) {
    await auth.initAuth();
  }

  // Set document title
  document.title = to.meta.title ? `${to.meta.title} | RBAC Portal` : 'Secure RBAC Portal';

  // 1. Guest-only pages (e.g. login)
  if (to.meta.guestOnly && auth.isAuthenticated.value) {
    if (auth.isAdmin.value) {
      return next('/admin/dashboard');
    } else {
      return next('/user/dashboard');
    }
  }

  // 2. Protected routes requiring authentication
  if (to.meta.requiresAuth) {
    if (!auth.isAuthenticated.value) {
      return next({
        path: '/login',
        query: { redirect: to.fullPath }
      });
    }

    // 3. Role verification
    if (to.meta.roles && !to.meta.roles.includes(auth.user.value.role)) {
      return next('/403');
    }

    // 4. Permission verification
    if (to.meta.permission && !auth.hasPermission(to.meta.permission)) {
      return next('/403');
    }
  }

  next();
});

export default router;

