import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useNotification } from '../hooks/useNotification';

/**
 * Axios instance
 * - withCredentials: true → Tự động gửi cookies (refresh_token)
 * - Không cần Authorization header vì sẽ được thêm động
 */
const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // ⚠️ Quan trọng: Cho phép gửi/nhận cookies
});

// Biến toàn cục để lưu access token (trong memory, không phải localStorage)
let accessToken = null;

/**
 * Set access token vào memory
 */
export const setAccessToken = (token) => {
  accessToken = token;
};

/**
 * Get access token từ memory
 */
export const getAccessToken = () => {
  return accessToken;
};

/**
 * Clear access token
 */
export const clearAccessToken = () => {
  accessToken = null;
};

/**
 * Request Interceptor
 * Tự động thêm access token vào header
 */
apiClient.interceptors.request.use(
  (config) => {
    // Nếu có access token, thêm vào Authorization header
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    
    console.log('🚀 Request:', config.method.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Xử lý auto refresh token khi 401
 */
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ Response:', response.status, response.config.url);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Kiểm tra nếu là lỗi 401 và chưa retry
    if (
      error.response?.status === 401 && 
      !originalRequest._retry &&
      originalRequest.url !== '/auth/refresh' // Tránh refresh token loop
    ) {
      // Nếu đang refresh, thêm request vào queue
      if (isRefreshing) {
        try {
          const token = await new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          });
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        } catch (err) {
          return Promise.reject(err);
        }
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Gọi refresh token API với timeout ngắn hơn
        const response = await axios.get('http://localhost:8080/api/v1/auth/refresh', {
          withCredentials: true,
          timeout: 5000 // Giảm timeout để fail fast
        });

        const newAccessToken = response.data.access_token;
        if (!newAccessToken) {
          throw new Error('No access token received');
        }

        // Lưu token mới
        setAccessToken(newAccessToken);
        
        // Xử lý queue
        processQueue(null, newAccessToken);
        
        // Retry request gốc
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
        
      } catch (refreshError) {
        // Xử lý lỗi refresh token
        processQueue(refreshError, null);
        clearAccessToken();

        // Nếu refresh token hết hạn hoặc không hợp lệ
        if (refreshError.response?.status === 401 || refreshError.response?.status === 403) {
          // Clear storage và redirect về login
          const { logout } = useAuth();
          const { showError } = useNotification();
          
          await logout(); // This will clear storage and auth context
          showError('Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.');
          window.location.href = '/login';
        } else {
          // Các lỗi khác (network, server, etc)
          console.error('Refresh token error:', refreshError);
          const { showError } = useNotification();
          showError('Có lỗi xảy ra khi làm mới phiên làm việc. Vui lòng đăng nhập lại.');
          window.location.href = '/login';
        }
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Xử lý các lỗi không phải 401
    console.error('❌ Response Error:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.response?.data?.message || error.message
    });

    // Trả về error message từ server hoặc default message
    const errorMessage = error.response?.data?.message || error.message || 'Something went wrong';
    return Promise.reject(new Error(errorMessage));
  }
);

export { apiClient };