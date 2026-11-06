import api from './api';

export const dashboardService = {
  async getAdminStats() {
    const response = await api.get('/dashboard/admin');
    return response.data;
  },

  async getUserStats() {
    const response = await api.get('/dashboard/user');
    return response.data;
  }
};

