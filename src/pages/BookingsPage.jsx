import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Search, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  XCircle, 
  Eye, 
  ChevronRight,
  Inbox
} from 'lucide-react';
import { format, isToday, isFuture, isPast, parseISO } from 'date-fns';

const BookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('Upcoming');
  const [selectedBooking, setSelectedBooking] = useState(null);

  const tabs = ['Upcoming', 'Today', 'Past', 'Cancelled'];

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          services (
            name,
            price,
            duration
          )
        `)
        .eq('business_id', user.id)
        .order('start_time', { ascending: true });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    const { error } = await supabase
      .from('bookings')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      alert('Failed to update status');
    } else {
      fetchBookings();
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.client_name.toLowerCase().includes(searchTerm.toLowerCase());
    const date = parseISO(booking.start_time);
    
    if (!matchesSearch) return false;

    switch (activeTab) {
      case 'Today': return isToday(date) && booking.status !== 'cancelled';
      case 'Upcoming': return isFuture(date) && booking.status !== 'cancelled';
      case 'Past': return isPast(date) && !isToday(date) && booking.status !== 'cancelled';
      case 'Cancelled': return booking.status === 'cancelled';
      default: return true;
    }
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Manage Bookings</h1>
        
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by client name..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap border-b-2 ${
              activeTab === tab 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
          <Inbox className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">No bookings found for "{activeTab}"</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredBookings.map((booking) => (
            <div key={booking.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-bold text-lg text-gray-900">{booking.client_name}</h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-6 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {format(parseISO(booking.start_time), 'PPP')}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    {format(parseISO(booking.start_time), 'p')} • {booking.services?.name}
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    {booking.client_phone}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setSelectedBooking(booking)}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  Details
                </button>
                {booking.status !== 'cancelled' && (
                  <button
                    onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-xl font-bold text-gray-900">Booking Details</h2>
              <button onClick={() => setSelectedBooking(null)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Client</p>
                  <p className="font-semibold">{selectedBooking.client_name}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 border border-gray-100 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase font-bold mb-1">Service</p>
                  <p className="text-sm font-medium">{selectedBooking.services?.name}</p>
                  <p className="text-sm text-blue-600 font-bold mt-1">${selectedBooking.services?.price}</p>
                </div>
                <div className="p-3 border border-gray-100 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase font-bold mb-1">Status</p>
                  <span className={`text-xs px-2 py-1 rounded-full font-bold ${getStatusColor(selectedBooking.status)}`}>
                    {selectedBooking.status.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">{selectedBooking.client_email}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span className="text-sm">{selectedBooking.client_phone}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">{format(parseISO(selectedBooking.start_time), 'PPPP p')}</span>
                </div>
              </div>

              {selectedBooking.notes && (
                <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                  <p className="text-xs text-yellow-700 font-bold mb-1 uppercase">Notes</p>
                  <p className="text-sm text-yellow-800 italic">"{selectedBooking.notes}"</p>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedBooking(null)}
              className="w-full mt-8 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingsPage;