import api from './api';

export const authService = {
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  async logout() {
    try {
      const response = await api.post('/auth/logout');
      return response.data;
    } catch (e) {
      // Still allow client logout even if backend fails
      return { success: true };
    }
  },

  async getMe() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  async changePassword(currentPassword, newPassword) {
    const response = await api.post('/auth/change-password', {
      currentPassword,
      newPassword
    });
    return response.data;
  }
};

