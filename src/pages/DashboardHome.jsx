import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Calendar, Users, TrendingUp, Clock, Plus, Settings, Eye } from 'lucide-react';
import { format, isToday, isTomorrow, parseISO, isAfter, startOfDay } from 'date-fns';

const DashboardHome = () => {
  const navigate = useNavigate();
  const [business, setBusiness] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    todayBookings: 0,
    upcomingBookings: 0,
    totalClients: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      // Fetch business
      const { data: businessData } = await supabase
        .from('businesses')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setBusiness(businessData);

      if (businessData) {
        // Fetch bookings
        const { data: bookingsData } = await supabase
          .from('bookings')
          .select(`*, services(name, price)`)
          .eq('business_id', businessData.id)
          .eq('status', 'confirmed')
          .order('booking_date', { ascending: true })
          .order('start_time', { ascending: true });

        setBookings(bookingsData || []);

        // Fetch services
        const { data: servicesData } = await supabase
          .from('services')
          .select('*')
          .eq('business_id', businessData.id)
          .eq('is_active', true);

        setServices(servicesData || []);

        // Calculate stats
        const today = format(new Date(), 'yyyy-MM-dd');
        const tomorrow = format(new Date(Date.now() + 86400000), 'yyyy-MM-dd');
        
        const todayCount = bookingsData?.filter(b => b.booking_date === today).length || 0;
        const upcomingCount = bookingsData?.filter(b => b.booking_date >= today).length || 0;
        const totalRevenue = bookingsData?.reduce((sum, b) => sum + (b.services?.price || 0), 0) || 0;

        // Fetch unique clients count
        const { data: clientsData } = await supabase
          .from('bookings')
          .select('client_email')
          .eq('business_id', businessData.id)
          .eq('status', 'confirmed');

        const uniqueClients = new Set(clientsData?.map(c => c.client_email)).size;

        setStats({
          todayBookings: todayCount,
          upcomingBookings: upcomingCount,
          totalClients: uniqueClients,
          totalRevenue: totalRevenue
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const upcomingBookings = bookings.slice(0, 5);
  const accentColor = business?.accent_color || '#3B82F6';
  const brandColor = business?.brand_color || '#3B82F6';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderBottomColor: accentColor }}></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 md:p-8">
      {/* Welcome Section */}
      <div className="mb-8 rounded-2xl shadow-lg overflow-hidden" style={{ background: `linear-gradient(135deg, ${brandColor}99, ${accentColor}99)` }}>
        <div className="p-8 text-white flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Welcome back, {business?.owner_name || 'Business Owner'}! 👋</h1>
            <p className="text-lg opacity-90">
              {business?.description || `Manage your ${business?.business_name} bookings and grow your business`}
            </p>
          </div>
          {business?.logo_url && (
            <img src={business.logo_url} alt={business.business_name} className="h-24 w-24 rounded-full object-cover opacity-90 hidden md:block border-4 border-white flex-shrink-0" />
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Today's Bookings */}
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4" style={{ borderLeftColor: brandColor }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Today's Appointments</p>
              <p className="text-4xl font-bold text-gray-800 mt-2">{stats.todayBookings}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full flex items-center justify-center flex-shrink-0">
              <Calendar className="w-6 h-6" style={{ color: accentColor }} />
            </div>
          </div>
        </div>

        {/* Upcoming Bookings */}
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4" style={{ borderLeftColor: accentColor }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Upcoming Appointments</p>
              <p className="text-4xl font-bold text-gray-800 mt-2">{stats.upcomingBookings}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Total Clients */}
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Clients</p>
              <p className="text-4xl font-bold text-gray-800 mt-2">{stats.totalClients}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full flex items-center justify-center flex-shrink-0">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-amber-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Revenue</p>
              <p className="text-4xl font-bold text-gray-800 mt-2">${stats.totalRevenue}</p>
            </div>
            <div className="bg-amber-100 p-3 rounded-full flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upcoming Bookings */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between" style={{ backgroundColor: `${brandColor}10` }}>
              <h2 className="text-2xl font-bold text-gray-800">📅 Upcoming Appointments</h2>
              <button
                onClick={() => navigate('/dashboard/bookings')}
                className="text-sm font-semibold px-4 py-2 rounded-lg transition flex items-center gap-2"
                style={{ backgroundColor: accentColor, color: 'white' }}
              >
                <Eye className="w-4 h-4" /> View All
              </button>
            </div>

            <div className="divide-y max-h-96 overflow-y-auto">
              {upcomingBookings.length > 0 ? (
                upcomingBookings.map((booking) => (
                  <div key={booking.id} className="p-6 hover:bg-gray-50 transition">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-lg">{booking.client_name}</h3>
                        <p className="text-sm text-gray-600 mt-1">📧 {booking.client_email}</p>
                        <p className="text-sm text-gray-700 mt-2 font-medium">{booking.services?.name}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-2 justify-end">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span className="font-semibold text-gray-800">
                            {format(parseISO(`${booking.booking_date}T${booking.start_time}`), 'MMM dd, h:mm a')}
                          </span>
                        </div>
                        <span
                          className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-white"
                          style={{ backgroundColor: accentColor }}
                        >
                          ${booking.services?.price || 0}
                        </span>
                      </div>
                    </div>
                    {booking.client_phone && (
                      <p className="text-sm text-gray-600 mt-3">📱 {booking.client_phone}</p>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-12 text-center">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">No upcoming appointments</p>
                  <p className="text-sm text-gray-400 mt-1">Your bookings will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions & Services */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200" style={{ backgroundColor: `${accentColor}10` }}>
              <h3 className="text-xl font-bold text-gray-800">⚡ Quick Actions</h3>
            </div>
            <div className="p-6 space-y-3">
              <button
                onClick={() => navigate('/dashboard/services')}
                className="w-full flex items-center gap-3 p-4 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition font-semibold text-gray-700"
              >
                <Plus className="w-5 h-5" />
                Manage Services
              </button>
              <button
                onClick={() => navigate('/dashboard/availability')}
                className="w-full flex items-center gap-3 p-4 rounded-lg border-2 border-gray-200 hover:border-green-500 hover:bg-green-50 transition font-semibold text-gray-700"
              >
                <Clock className="w-5 h-5" />
                Set Availability
              </button>
              <button
                onClick={() => navigate('/dashboard/settings')}
                className="w-full flex items-center gap-3 p-4 rounded-lg border-2 border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition font-semibold text-gray-700"
              >
                <Settings className="w-5 h-5" />
                Business Settings
              </button>
            </div>
          </div>

          {/* Services Overview */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200" style={{ backgroundColor: `${brandColor}10` }}>
              <h3 className="text-xl font-bold text-gray-800">Services ({services.length})</h3>
            </div>
            <div className="p-6 space-y-3 max-h-64 overflow-y-auto">
              {services.length > 0 ? (
                services.map((service) => (
                  <div key={service.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                    <div>
                      <p className="font-semibold text-gray-800">{service.name}</p>
                      <p className="text-sm text-gray-600">{service.duration_minutes} mins • ${service.price}</p>
                    </div>
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: accentColor }}
                    ></div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-4">No services added yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;