import api from './api';

export const roleService = {
  async getRoles() {
    const response = await api.get('/roles');
    return response.data;
  },

  async getPermissions() {
    const response = await api.get('/roles/permissions');
    return response.data;
  },

  async getRolePermissions(roleId) {
    const response = await api.get(`/roles/${roleId}/permissions`);
    return response.data;
  },

  async updateRolePermissions(roleId, permissionIds) {
    const response = await api.put(`/roles/${roleId}/permissions`, {
      permission_ids: permissionIds
    });
    return response.data;
  }
};

