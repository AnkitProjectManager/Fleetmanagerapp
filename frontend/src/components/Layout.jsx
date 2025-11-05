import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/Button';
import { 
  Car, 
  Settings, 
  Users, 
  FileText, 
  BarChart3, 
  LogOut,
  Wrench,
  Receipt
} from 'lucide-react';

const Layout = () => {
  const { user, logout, isAdmin, isFleetManager, isTechnician } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigation = [
    { 
      name: 'Dashboard', 
      href: '/dashboard', 
      icon: BarChart3, 
      roles: ['admin', 'fleet_manager', 'technician', 'driver'] 
    },
    { 
      name: 'Vehicles', 
      href: '/vehicles', 
      icon: Car, 
      roles: ['admin', 'fleet_manager', 'driver'] 
    },
    { 
      name: 'Service Requests', 
      href: '/service-requests', 
      icon: FileText, 
      roles: ['admin', 'fleet_manager', 'technician'] 
    },
    { 
      name: 'Technicians', 
      href: '/technicians', 
      icon: Wrench, 
      roles: ['admin', 'fleet_manager'] 
    },
    { 
      name: 'Invoices', 
      href: '/invoices', 
      icon: Receipt, 
      roles: ['admin', 'fleet_manager'] 
    },
    { 
      name: 'Settings', 
      href: '/settings', 
      icon: Settings, 
      roles: ['admin'] 
    },
  ];

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(user?.role)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
        <div className="flex h-16 items-center px-6 border-b">
          <h1 className="text-xl font-bold text-gray-900">
            Roll & Charge
          </h1>
        </div>
        
        <nav className="mt-6 px-3">
          <ul className="space-y-1">
            {filteredNavigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? 'bg-primary-50 text-primary-600 border-r-2 border-primary-600'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Main content */}
      <div className="pl-64">
        {/* Top bar */}
        <div className="bg-white shadow-sm border-b h-16 flex items-center justify-between px-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Welcome, {user?.firstName} {user?.lastName}
            </h2>
            <p className="text-sm text-gray-500 capitalize">
              {user?.role?.replace('_', ' ')}
            </p>
          </div>
          
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="flex items-center space-x-2"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </Button>
        </div>

        {/* Page content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;