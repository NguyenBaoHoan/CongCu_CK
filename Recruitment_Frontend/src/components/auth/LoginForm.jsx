import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { validators } from '../../utils/validators';
import OAuthButtons from './OAuthButtons'; // ✅ Thêm import
/**
 * LoginForm - Component form đăng nhập
 * Features:
 * - Validation real-time
 * - Show/hide password
 * - Error handling
 * - Loading state
 */

const LoginForm = ({ onSubmit, loading, error }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  /**
   * Validate form khi người dùng nhập
   */
  const validateField = (name, value) => {
    let error = '';

    if (name === 'username') {
      if (!validators.isRequired(value)) {
        error = 'Email is required';
      } else if (!validators.isValidEmail(value)) {
        error = 'Invalid email format';
      }
    }

    if (name === 'password') {
      if (!validators.isRequired(value)) {
        error = 'Password is required';
      } else if (!validators.isValidPassword(value)) {
        error = 'Password must be at least 6 characters';
      }
    }

    setErrors(prev => ({
      ...prev,
      [name]: error
    }));

    return !error;
  };

  /**
   * Handle input change
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Validate khi người dùng typing
    validateField(name, value);
  };

  /**
   * Handle form submit
   */
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate tất cả fields
    const isUsernameValid = validateField('username', formData.username);
    const isPasswordValid = validateField('password', formData.password);

    // Nếu valid → gọi onSubmit
    if (isUsernameValid && isPasswordValid) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Server Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Email Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="email"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="your.email@example.com"
            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
              errors.username 
                ? 'border-red-300 focus:ring-red-500' 
                : 'border-gray-300 focus:ring-blue-500'
            }`}
          />
        </div>
        {errors.username && (
          <p className="mt-1 text-sm text-red-600">{errors.username}</p>
        )}
      </div>

      {/* Password Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
              errors.password 
                ? 'border-red-300 focus:ring-red-500' 
                : 'border-gray-300 focus:ring-blue-500'
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password}</p>
        )}
      </div>

      {/* Remember Me & Forgot Password */}
      <div className="flex items-center justify-between">
        <label className="flex items-center">
          <input type="checkbox" className="mr-2 rounded border-gray-300" />
          <span className="text-sm text-gray-600">Remember me</span>
        </label>
        <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700">
          Forgot password?
        </Link>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Signing in...
          </span>
        ) : (
          'Sign In'
        )}
      </button>

      {/* ✅ THÊM: OAuth Buttons */}
      <OAuthButtons providers={['google', 'github', 'facebook']} />

      {/* Register Link */}
      <p className="text-center text-sm text-gray-600">
        Don't have an account?{' '}
        <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium">
          Create one
        </Link>
      </p>
    </form>
  );
};

export default LoginForm;