import { useEffect } from 'react';
import { Outlet } from 'react-router-dom'
import { useNavigate } from 'react-router-dom';
import NotificationContainer from './components/common/NotificationContainer'
import { initAuth } from './services/apiService';

function App() {
  const navigate = useNavigate();

  useEffect(() => {
    initAuth();

    const onAuthExpired = (e) => {
      alert(e.detail.message);
      navigate('/login');
    };
    window.addEventListener('auth:expired', onAuthExpired);
    return () => window.removeEventListener('auth:expired', onAuthExpired);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Outlet />
      <NotificationContainer />
    </div>
  )
}

export default App