import { apiClient } from './apiService';

export const userService = {
  list: async ({ page = 0, size = 10, search = '' } = {}) => {
    const response = await apiClient.get('/users', { params: { page, size, search } });
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },
};
