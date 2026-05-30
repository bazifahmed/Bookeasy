import { useState, useEffect } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../content/AuthContext';
import { 
  Menu, 
  X, 
  LayoutDashboard, 
  Calendar, 
  Briefcase, 
  Clock, 
  Users, 
  Settings,
  LogOut,
  ExternalLink
} from 'lucide-react';

const DashboardLayout = ({ businessName = "BookEasy", accentColor = "#3B82F6", businessSlug = null, children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  // Close sidebar on mobile when route changes
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/dashboard/bookings', icon: Calendar, label: 'Bookings' },
    { path: '/dashboard/services', icon: Briefcase, label: 'Services' },
    { path: '/dashboard/availability', icon: Clock, label: 'Availability' },
    { path: '/dashboard/clients', icon: Users, label: 'Clients' },
    { path: '/dashboard/settings', icon: Settings, label: 'Settings' },
  ];

  const isActiveLink = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Hamburger Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
        aria-label="Toggle menu"
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-40
          transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:w-64
          ${isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Brand */}
          <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
            <h1 className="text-xl font-bold" style={{ color: accentColor }}>
              {businessName}
            </h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActiveLink(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center px-3 py-2 rounded-lg transition-colors duration-200
                    ${active 
                      ? 'bg-gray-100 font-medium' 
                      : 'hover:bg-gray-50'
                    }
                  `}
                  style={{ 
                    color: active ? accentColor : '#374151'
                  }}
                >
                  <Icon size={20} className="mr-3" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 py-3 lg:px-6">
            <div className="flex-1">
              {/* Spacer for mobile menu button alignment */}
              <div className="lg:hidden w-8"></div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Business Name (visible on mobile) */}
              <span className="lg:hidden text-sm font-medium text-gray-700">
                {businessName}
              </span>
              
              {/* View Booking Page Button */}
              <Link
                to={businessSlug ? `/book/${businessSlug}` : '/book/slug-placeholder'}
                target="_blank"
                className="
                  flex items-center px-3 py-2 text-sm font-medium rounded-lg
                  bg-white border border-gray-300 text-gray-700
                  hover:bg-gray-50 transition-colors duration-200
                "
              >
                <ExternalLink size={16} className="mr-2" />
                View My Booking Page
              </Link>
              
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="
                  flex items-center px-3 py-2 text-sm font-medium rounded-lg
                  bg-red-50 text-red-600 hover:bg-red-100
                  transition-colors duration-200
                "
              >
                <LogOut size={16} className="mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-6">
          {children || <Outlet />}
        </main>
      </div>

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default DashboardLayout;