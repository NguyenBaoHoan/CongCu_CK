import { useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import { authService } from '../services/authService';
import { clearAccessToken, getAccessToken } from '../services/apiService';
import { useNotification } from '../hooks/useNotification';

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const { showSuccess } = useNotification();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    // ✅ Kiểm tra xem có access token trong memory không
    const hasAccessToken = getAccessToken();
    
    if (!hasAccessToken) {
      console.log('No access token in memory - trying refresh token from cookie');
      // ✅ Không có access token, thử refresh từ cookie
      try {
        await authService.refreshToken();
        const userData = await authService.getCurrentUser();
        setUser(userData);
        setIsAuthenticated(true);
        console.log('✅ Successfully refreshed token from cookie');
      } catch {
        console.log('No active session - no valid refresh token in cookie');
        setUser(null);
        setIsAuthenticated(false);
        clearAccessToken();
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      // ✅ Thử getCurrentUser với access token hiện tại
      const userData = await authService.getCurrentUser();
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      // ✅ Nếu 401, thử refresh token (có thể có refresh_token cookie)
      if (error.message?.includes('401') || error.response?.status === 401) {
        try {
          await authService.refreshToken();
          const userData = await authService.getCurrentUser();
          setUser(userData);
          setIsAuthenticated(true);
        } catch {
          console.log('No active session - no valid refresh token');
          setUser(null);
          setIsAuthenticated(false);
          clearAccessToken();
        }
      } else {
        console.log('Error getting user info:', error);
        setUser(null);
        setIsAuthenticated(false);
        clearAccessToken();
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Login function
   */
  const login = async (username, password) => {
    const data = await authService.login(username, password);
    
    // Lấy thông tin user sau khi login thành công
    try {
      const userData = await authService.getCurrentUser();
      setUser(userData);
      setIsAuthenticated(true);
      
      // Hiển thị thông báo đăng nhập thành công
      showSuccess(`Welcome back, ${userData.name || userData.email || 'User'}! Login successful.`);
    } catch {   
      // Nếu không lấy được user info, vẫn set authenticated = true
      setUser(data.user || { email: username });
      setIsAuthenticated(true);
      showSuccess(`Welcome back! Login successful.`);
    }
    
    return data;
  };

  /**
   * Logout function
   */
  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
      clearAccessToken();
    } catch (error) {
      console.error('Logout error:', error);
      setUser(null);
      setIsAuthenticated(false);
      clearAccessToken();
    }
  };

  /**
   * Update user info
   */
  const updateUser = (userData) => {
    setUser(userData);
  };


  const handleOAuth2Auth = async () => {
    try {
      const userData = await authService.getCurrentUser();
      setUser(userData);
      setIsAuthenticated(true);
      console.log('✅ OAuth2 authentication successful');
    } catch (error) {
      console.log('OAuth2 authentication failed:', error.message);
      setUser(null);
      setIsAuthenticated(false);
      clearAccessToken();
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    updateUser,
    handleOAuth2Auth // ✅ Thêm method này
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}