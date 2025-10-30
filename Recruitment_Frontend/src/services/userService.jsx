import { apiClient } from './apiService';

export const userService = {
  // Task 1: Danh sách + tìm kiếm + phân trang
  list: async ({ page = 0, size = 10, search = '' } = {}) => {
    const response = await apiClient.get('/users', { params: { page, size, search } });
    return response.data;
  },

  // Task 2: Tạo/Sửa người dùng
  getById: async (id) => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },

  create: async (payload) => {
    const response = await apiClient.post('/users', payload);
    return response.data;
  },

  update: async (id, payload) => {
    const response = await apiClient.put(`/users/${id}`, payload);
    return response.data;
  },
};