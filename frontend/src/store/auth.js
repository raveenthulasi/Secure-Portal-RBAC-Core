import { reactive, computed } from 'vue';
import api from '../services/api';

const state = reactive({
  token: localStorage.getItem('rbac_token') || null,
  user: null,
  isLoading: true
});

// Try to hydrate user from localStorage
try {
  const cachedUser = localStorage.getItem('rbac_user');
  if (cachedUser) {
    state.user = JSON.parse(cachedUser);
  }
} catch (e) {
  localStorage.removeItem('rbac_user');
}

export const useAuthStore = () => {
  const isAuthenticated = computed(() => !!state.token && !!state.user);
  const isAdmin = computed(() => state.user?.role === 'admin');
  const isUser = computed(() => state.user?.role === 'user');

  const hasPermission = (permissionName) => {
    if (!state.user) return false;
    if (state.user.role === 'admin') return true; // Admins have master permissions
    return Array.isArray(state.user.permissions) && state.user.permissions.includes(permissionName);
  };

  const hasAnyPermission = (permissionList = []) => {
    if (!state.user) return false;
    if (state.user.role === 'admin') return true;
    return permissionList.some(p => hasPermission(p));
  };

  const setAuth = (token, user) => {
    state.token = token;
    state.user = user;
    localStorage.setItem('rbac_token', token);
    localStorage.setItem('rbac_user', JSON.stringify(user));
  };

  const clearAuth = () => {
    state.token = null;
    state.user = null;
    localStorage.removeItem('rbac_token');
    localStorage.removeItem('rbac_user');
  };

  const updateUser = (updatedFields) => {
    if (state.user) {
      state.user = { ...state.user, ...updatedFields };
      localStorage.setItem('rbac_user', JSON.stringify(state.user));
    }
  };

  const initAuth = async () => {
    state.isLoading = true;
    if (!state.token) {
      state.isLoading = false;
      return false;
    }

    try {
      const response = await api.get('/auth/me');
      if (response.data.success && response.data.user) {
        state.user = response.data.user;
        localStorage.setItem('rbac_user', JSON.stringify(response.data.user));
        state.isLoading = false;
        return true;
      }
    } catch (err) {
      clearAuth();
    } finally {
      state.isLoading = false;
    }
    return false;
  };

  return {
    state,
    user: computed(() => state.user),
    token: computed(() => state.token),
    isLoading: computed(() => state.isLoading),
    isAuthenticated,
    isAdmin,
    isUser,
    hasPermission,
    hasAnyPermission,
    setAuth,
    clearAuth,
    updateUser,
    initAuth
  };
};

