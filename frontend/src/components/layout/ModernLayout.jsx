import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  BarChart3, 
  Wrench, 
  Users, 
  FileText, 
  Settings, 
  Menu, 
  X, 
  ChevronDown,
  Bell,
  Search,
  User,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const { user, isAdmin, isFleetManager, isTechnician } = useAuth();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: BarChart3,
      current: location.pathname === '/dashboard',
      roles: ['admin', 'fleet_manager', 'technician', 'driver']
    },
    {
      name: 'Vehicles',
      href: '/vehicles',
      icon: Truck,
      current: location.pathname === '/vehicles',
      roles: ['admin', 'fleet_manager', 'driver']
    },
    {
      name: 'Service Requests',
      href: '/service-requests',
      icon: Wrench,
      current: location.pathname === '/service-requests',
      roles: ['admin', 'fleet_manager', 'technician']
    },
    {
      name: 'Technicians',
      href: '/technicians',
      icon: Users,
      current: location.pathname === '/technicians',
      roles: ['admin', 'fleet_manager']
    },
    {
      name: 'Invoices',
      href: '/invoices',
      icon: FileText,
      current: location.pathname === '/invoices',
      roles: ['admin', 'fleet_manager']
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      current: location.pathname === '/settings',
      roles: ['admin']
    }
  ];

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(user?.role)
  );

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-white/95 backdrop-blur-xl border-r border-secondary-200/50
        transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        shadow-large
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-secondary-200/50">
          <Link to="/dashboard" className="flex items-center">
            <img 
              src="/src/assets/ev-repair-logo.923ecc755fed70eb61ca (1).png" 
              alt="Roll & Charge Fleet Management" 
              className="h-8 w-auto" 
            />
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-1 rounded-md hover:bg-secondary-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {filteredNavigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsOpen(false)}
                className={`
                  flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200
                  ${item.current
                    ? 'bg-emerald-50 text-emerald-700 shadow-soft border border-emerald-200/50'
                    : 'text-secondary-700 hover:bg-secondary-50 hover:text-secondary-900'
                  }
                `}
              >
                <Icon className={`w-5 h-5 mr-3 ${item.current ? 'text-emerald-600' : ''}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User info */}
        <div className="p-4 border-t border-secondary-200/50">
          <div className="flex items-center space-x-3 px-3 py-2 rounded-xl bg-secondary-50/50">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-secondary-900 truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-secondary-500 capitalize">
                {user?.role?.replace('_', ' ')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const Header = ({ setSidebarOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/signin');
  };

  return (
    <header className="bg-white/95 backdrop-blur-xl border-b border-secondary-200/50 shadow-soft">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-md hover:bg-secondary-100 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search */}
          <div className="flex-1 max-w-lg mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400" />
              <input
                type="text"
                placeholder="Search vehicles, requests..."
                className="w-full pl-10 pr-4 py-2 border border-secondary-200 rounded-xl bg-secondary-50/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300 transition-colors text-sm"
              />
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="relative p-2 rounded-xl hover:bg-secondary-100 transition-colors">
              <Bell className="w-5 h-5 text-secondary-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-error-500 rounded-full"></span>
            </button>

            {/* Profile menu */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-3 px-3 py-2 rounded-xl hover:bg-secondary-100 transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-secondary-900">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-secondary-500 capitalize">
                    {user?.role?.replace('_', ' ')}
                  </p>
                </div>
                <ChevronDown className="w-4 h-4 text-secondary-500" />
              </button>

              {/* Dropdown */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 py-1 z-50">
                  <Link
                    to="/profile"
                    className="flex items-center px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    <User className="w-4 h-4 mr-3" />
                    Profile Settings
                  </Link>
                  <hr className="my-1 border-secondary-200" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-error-700 hover:bg-error-50"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

const ModernLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50/50 to-primary-50/30">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className="lg:pl-64">
        <Header setSidebarOpen={setSidebarOpen} />
        
        <main className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ModernLayout;