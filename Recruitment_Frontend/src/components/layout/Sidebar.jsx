import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  User, 
  Briefcase, 
  Heart, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
  Search,
  Bell,
  TrendingUp,
  Users,
  FileText
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const Sidebar = ({ isCollapsed, isMobileOpen, onToggle, onClose, user }) => {
  const location = useLocation();
  const { logout } = useAuth();

  const menuItems = [
    { 
      icon: Home, 
      label: 'Dashboard', 
      path: '/dashboard',
      badge: null
    },
    { 
      icon: Briefcase, 
      label: 'All Jobs', 
      path: '/jobs',
      badge: null
    },
    // { 
    //   icon: Search, 
    //   label: 'Search Jobs', 
    //   path: '/search',
    //   badge: null
    // },
    // { 
    //   icon: Heart, 
    //   label: 'Saved Jobs', 
    //   path: '/saved-jobs',
    //   badge: '12'
    // },
    // { 
    //   icon: FileText, 
    //   label: 'Applications', 
    //   path: '/applications',
    //   badge: '5'
    // },
    // { 
    //   icon: TrendingUp, 
    //   label: 'Analytics', 
    //   path: '/analytics',
    //   badge: null
    // },
    // { 
    //   icon: Users, 
    //   label: 'Network', 
    //   path: '/network',
    //   badge: null
    // },
    { 
      icon: User, 
      label: 'Users', 
      path: '/users',
      badge: null
    },
    // { 
    //   icon: Bell, 
    //   label: 'Notifications', 
    //   path: '/notifications',
    //   badge: '3'
    // },
    // { 
    //   icon: User, 
    //   label: 'Profile', 
    //   path: '/profile',
    //   badge: null
    // },
    // { 
    //   icon: Settings, 
    //   label: 'Settings', 
    //   path: '/settings',
    //   badge: null
    // },
  ];

  const handleLogout = async () => {
    await logout();
  };

  return (
    <>
      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full bg-white shadow-xl z-50 transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-16' : 'w-64'}
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        lg:relative lg:z-auto
        border-r border-gray-200
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className={`
            transition-all duration-300 ease-in-out overflow-hidden
            ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}
          `}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">R</span>
              </div>
              <h2 className="text-xl font-bold text-gray-800 whitespace-nowrap">
                Recruitment
              </h2>
            </div>
          </div>
          
          {/* Desktop Toggle */}
          <button
            onClick={onToggle}
            className="hidden lg:flex p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>

          {/* Mobile Close */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* User Profile Section */}
        {user && (
          <div className="p-4 border-b border-gray-200">
            <div className={`
              flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50
              transition-all duration-300 ease-in-out
              ${isCollapsed ? 'justify-center' : ''}
            `}>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-medium text-sm">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </span>
              </div>
              <div className={`
                transition-all duration-300 ease-in-out overflow-hidden
                ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}
              `}>
                <p className="font-medium text-gray-900 text-sm">
                  {user.name || 'User'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user.email}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={index}
                to={item.path}
                onClick={onClose}
                className={`
                  flex items-center gap-3 p-3 rounded-lg transition-all duration-200 group
                  ${isActive 
                    ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700 shadow-sm' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }
                  hover:scale-105 hover:shadow-md
                `}
                title={isCollapsed ? item.label : ''}
              >
                <div className="relative">
                  <Icon 
                    size={20} 
                    className={`
                      flex-shrink-0 transition-all duration-200
                      ${isActive ? 'scale-110' : 'scale-100'}
                    `} 
                  />
                  {item.badge && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className={`
                  font-medium transition-all duration-300 ease-in-out overflow-hidden
                  ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}
                `}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-4 left-4 right-4">
          <button
            onClick={handleLogout}
            className={`
              w-full flex items-center gap-3 p-3 rounded-lg text-red-600 hover:bg-red-50 
              transition-all duration-200 hover:scale-105 hover:shadow-md
              ${isCollapsed ? 'justify-center' : ''}
            `}
            title={isCollapsed ? 'Logout' : ''}
          >
            <LogOut size={20} className="flex-shrink-0" />
            <span className={`
              font-medium transition-all duration-300 ease-in-out overflow-hidden
              ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}
            `}>
              Logout
            </span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
