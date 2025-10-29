import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoginForm from '../components/auth/LoginForm';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ✅ Redirect if already authenticated
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const oauthStatus = params.get('oauth');
    const oauthError = params.get('error');
    const userEmail = params.get('email');
    const userName = params.get('name');

    if (oauthStatus === 'success') {
      console.log('✅ OAuth2 success:', { userName, userEmail });
      setError('');
      window.history.replaceState({}, document.title, location.pathname);
    }

    if (oauthError) {
      const decodedError = decodeURIComponent(oauthError);
      console.error('❌ OAuth2 error:', decodedError);
      setError(decodedError || 'Authentication failed. Please try again.');
      window.history.replaceState({}, document.title, location.pathname);
    }

    if (isAuthenticated && !authLoading) {
      console.log('✅ Redirecting to dashboard...');
      navigate('/dashboard');
    }
  }, [location, isAuthenticated, authLoading, navigate]);

  const handleLogin = async (formData) => {
    setLoading(true);
    setError('');

    try {
      await login(formData.username, formData.password);
      // Navigation will be handled by the useEffect above
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Show loading while auth is initializing
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to Recruitment</p>
        </div>

        {/* Login Form */}
        <LoginForm onSubmit={handleLogin} loading={loading} error={error} />
      </div>
    </div>
  );
};

export default LoginPage;