import { createContext } from 'react';

/**
 * AuthContext
 * - Quản lý user state toàn cục
 * - Không lưu token vào state (token ở memory trong apiService.js)
 */

export const AuthContext = createContext(null); // ⚠️ THÊM export ở đây
