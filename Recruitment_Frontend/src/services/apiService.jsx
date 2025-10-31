import axios from 'axios';

const BASE_URL = import.meta?.env?.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

const refreshClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

/**
 * Lưu access token vào memory và sessionStorage
 * để giữ được sau khi F5
 */
let accessToken = sessionStorage.getItem('accessToken') || null;

export const setAccessToken = (token) => {
  accessToken = token;
  sessionStorage.setItem('accessToken', token);
};

export const getAccessToken = () => accessToken;

export const clearAccessToken = () => {
  accessToken = null;
  sessionStorage.removeItem('accessToken');
};

apiClient.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    if (import.meta.env.DEV) {
      const method = (config.method || '').toUpperCase();
      // console.log(`🚀 [${method}] ${config.url}`);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      // console.log(`✅ [${response.status}] ${response.config.url}`);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/auth/refresh')
    ) {
      if (isRefreshing) {

        try {
          const newToken = await new Promise((resolve, reject) =>
            failedQueue.push({ resolve, reject })
          );
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        } catch (err) {
          return Promise.reject(err);
        }
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await refreshClient.get('/auth/refresh');
        const newAccessToken = res.data?.accessToken;

        if (!newAccessToken) throw new Error('Không nhận được access token mới');

        setAccessToken(newAccessToken);
        processQueue(null, newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearAccessToken();

        window.dispatchEvent(
          new CustomEvent('auth:expired', {
            detail: { message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.' },
          })
        );

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    const status = error.response?.status;
    const message = error.response?.data?.message || error.message || 'Đã xảy ra lỗi';
    if (import.meta.env.DEV) {
      console.error(`❌ [${status}] ${originalRequest?.url}: ${message}`);
    }

    return Promise.reject(new Error(message));
  }
);


export const initAuth = async () => {
  try {

    if (!getAccessToken()) {
      const res = await refreshClient.get('/auth/refresh');
      const newToken = res.data?.accessToken;
      if (newToken) setAccessToken(newToken);
    }
  } catch {
    clearAccessToken();
  }
};

export { apiClient };
