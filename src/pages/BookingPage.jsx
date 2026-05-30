// src/pages/BookingPage.jsx
import { sendBookingConfirmation } from "../utils/emailService";
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { format, addDays, parseISO, isSameDay, isBefore, startOfDay, setHours, setMinutes } from 'date-fns';

const BookingPage = () => {
  const { slug } = useParams();
  
  // State
  const [business, setBusiness] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  
  // Step 1
  const [selectedService, setSelectedService] = useState(null);
  
  // Step 2
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  
  // Step 3
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [bookingError, setBookingError] = useState(null);
  
  // Calendar state
  const [calendarDays, setCalendarDays] = useState([]);
  
  // Fetch business and services on load
  useEffect(() => {
    fetchBusinessAndServices();
  }, [slug]);
  
  // Generate calendar days when business loads
  useEffect(() => {
    if (business) {
      generateCalendarDays();
    }
  }, [business]);
  
  // Fetch available slots when date changes
  useEffect(() => {
    if (selectedDate && selectedService && business) {
      fetchAvailableSlots();
    }
  }, [selectedDate, selectedService, business]);
  
  const fetchBusinessAndServices = async () => {
    try {
      setLoading(true);
      
      // Fetch business by slug
      const { data: businessData, error: businessError } = await supabase
        .from('businesses')
        .select('*')
        .eq('slug', slug)
        .single();
      
      if (businessError) throw businessError;
      setBusiness(businessData);
      
      // Fetch active services for this business
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .eq('business_id', businessData.id)
        .eq('is_active', true)
        .order('name');
      
      if (servicesError) throw servicesError;
      setServices(servicesData);
      
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const generateCalendarDays = () => {
    const days = [];
    const today = startOfDay(new Date());
    
    for (let i = 0; i < 30; i++) {
      const date = addDays(today, i);
      days.push(date);
    }
    
    setCalendarDays(days);
  };
  
  const fetchAvailableSlots = async () => {
    try {
      setLoadingSlots(true);
      setSelectedTime(null);
      
      // Get day of week (0 = Sunday, 1 = Monday, etc.)
      const dayOfWeek = selectedDate.getDay();
      
      // Fetch business availability for this day
      const { data: availabilityData, error: availabilityError } = await supabase
        .from('availability')
        .select('*')
        .eq('business_id', business.id)
        .eq('day_of_week', dayOfWeek)
        .maybeSingle();
      
      if (availabilityError) throw availabilityError;
      
      if (!availabilityData || !availabilityData.is_available) {
        setAvailableSlots([]);
        return;
      }
      
      // Generate time slots based on service duration
      const slots = generateTimeSlots(
        availabilityData.start_time,
        availabilityData.end_time,
        selectedService.duration
      );
      
      // Fetch existing bookings for this date
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('booking_time')
        .eq('business_id', business.id)
        .eq('booking_date', dateStr)
        .eq('status', 'confirmed');
      
      if (bookingsError) throw bookingsError;
      
      const bookedTimes = new Set(bookingsData.map(b => b.booking_time));
      
      // Fetch blocked times for this date
      const { data: blockedData, error: blockedError } = await supabase
        .from('blocked_times')
        .select('start_time, end_time')
        .eq('business_id', business.id)
        .eq('blocked_date', dateStr);
      
      if (blockedError) throw blockedError;
      
      // Filter available slots
      const available = slots.filter(slot => {
        // Check if already booked
        if (bookedTimes.has(slot.time)) return false;
        
        // Check if within any blocked period
        const slotDateTime = setHours(setMinutes(selectedDate, parseInt(slot.time.split(':')[1])), parseInt(slot.time.split(':')[0]));
        const slotEndDateTime = new Date(slotDateTime.getTime() + selectedService.duration * 60000);
        
        for (const block of blockedData) {
          const blockStart = parseISO(`${dateStr}T${block.start_time}`);
          const blockEnd = parseISO(`${dateStr}T${block.end_time}`);
          
          if (slotDateTime < blockEnd && slotEndDateTime > blockStart) {
            return false;
          }
        }
        
        return true;
      });
      
      setAvailableSlots(available);
      
    } catch (error) {
      console.error('Error fetching slots:', error);
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };
  
  const generateTimeSlots = (startTime, endTime, durationMinutes) => {
    const slots = [];
    let current = parseISO(`2000-01-01T${startTime}`);
    const end = parseISO(`2000-01-01T${endTime}`);
    
    while (current < end) {
      const timeStr = format(current, 'HH:mm');
      slots.push({
        time: timeStr,
        display: format(current, 'h:mm a')
      });
      current = new Date(current.getTime() + durationMinutes * 60000);
    }
    
    return slots;
  };
  
  const handleServiceSelect = (service) => {
    setSelectedService(service);
    setStep(2);
  };
  
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedTime(null);
  };
  
  const handleTimeSelect = (slot) => {
    setSelectedTime(slot);
  };
  
  const handleNextToDetails = () => {
    if (selectedTime) {
      setStep(3);
    }
  };
  
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      setBookingError(null);
      
      const bookingDateTime = new Date(selectedDate);
      const [hours, minutes] = selectedTime.time.split(':');
      bookingDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      const bookingData = {
        business_id: business.id,
        service_id: selectedService.id,
        customer_name: formData.full_name,
        customer_email: formData.email,
        customer_phone: formData.phone || null,
        notes: formData.notes || null,
        booking_date: format(selectedDate, 'yyyy-MM-dd'),
        booking_time: selectedTime.time,
        booking_datetime: bookingDateTime.toISOString(),
        status: 'confirmed',
        total_price: selectedService.price,
        created_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('bookings')
        .insert([bookingData])
        .select()
        .single();
      
      if (error) throw error;
      
      setBookingSuccess({
        id: data.id,
        service: selectedService.name,
        date: format(selectedDate, 'MMMM do, yyyy'),
        time: selectedTime.display,
        price: selectedService.price,
        customer_name: formData.full_name,
        customer_email: formData.email
      });

      // Send confirmation email to client + notification to business owner
      try {
        await sendBookingConfirmation({
          clientName: formData.full_name,
          clientEmail: formData.email,
          businessName: business.name,
          serviceName: selectedService.name,
          date: format(selectedDate, 'MMMM do, yyyy'),
          time: selectedTime.display,
          price: `$${selectedService.price}`,
          ownerEmail: business.owner_email,
          clientPhone: formData.phone || 'Not provided',
        });
      } catch (emailErr) {
        // Don't block booking completion if email fails
        console.error('Email send failed:', emailErr);
      }
      
      // Reset form or show success
      setStep(4); // Success step
      
    } catch (error) {
      console.error('Error creating booking:', error);
      setBookingError(error.message);
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleReset = () => {
    setStep(1);
    setSelectedService(null);
    setSelectedDate(null);
    setSelectedTime(null);
    setFormData({
      full_name: '',
      email: '',
      phone: '',
      notes: ''
    });
    setBookingSuccess(null);
    setBookingError(null);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!business) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Business not found</p>
        </div>
      </div>
    );
  }
  
  // Success Step
  if (step === 4 && bookingSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Booking Confirmed!</h2>
            <p className="text-gray-600 mb-6">Your appointment has been successfully booked.</p>
            
            <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
              <h3 className="font-semibold text-gray-800 mb-3">Booking Details:</h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Service:</span> {bookingSuccess.service}</p>
                <p><span className="font-medium">Date:</span> {bookingSuccess.date}</p>
                <p><span className="font-medium">Time:</span> {bookingSuccess.time}</p>
                <p><span className="font-medium">Price:</span> ${bookingSuccess.price}</p>
                <p><span className="font-medium">Name:</span> {bookingSuccess.customer_name}</p>
                <p><span className="font-medium">Email:</span> {bookingSuccess.customer_email}</p>
              </div>
            </div>
            
            <button
              onClick={handleReset}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Book Another Appointment
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Business Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8 text-center" style={{ borderTop: `4px solid ${business.brand_color || '#3B82F6'}` }}>
          {business.logo_url && (
            <img src={business.logo_url} alt={business.name} className="h-20 mx-auto mb-4 object-contain" />
          )}
          <h1 className="text-3xl font-bold text-gray-800">{business.name}</h1>
          {business.description && (
            <p className="text-gray-600 mt-2">{business.description}</p>
          )}
        </div>
        
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex-1 text-center">
                <div className={`w-10 h-10 rounded-full mx-auto flex items-center justify-center font-semibold ${
                  step >= stepNum ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  {stepNum}
                </div>
                <p className="text-sm mt-2 text-gray-600">
                  {stepNum === 1 && 'Select Service'}
                  {stepNum === 2 && 'Pick Date & Time'}
                  {stepNum === 3 && 'Your Details'}
                </p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Step 1 - Select Service */}
        {step === 1 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Choose a Service</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {services.map((service) => (
                <button
                  key={service.id}
                  onClick={() => handleServiceSelect(service)}
                  className="border-2 border-gray-200 rounded-lg p-4 text-left hover:border-blue-500 hover:shadow-md transition-all"
                >
                  <h3 className="font-semibold text-lg text-gray-800">{service.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{service.duration} minutes</p>
                  <p className="text-xl font-bold text-blue-600 mt-2">${service.price}</p>
                  {service.description && (
                    <p className="text-sm text-gray-500 mt-2">{service.description}</p>
                  )}
                </button>
              ))}
            </div>
            {services.length === 0 && (
              <p className="text-center text-gray-500">No services available at this time.</p>
            )}
          </div>
        )}
        
        {/* Step 2 - Pick Date & Time */}
        {step === 2 && selectedService && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="mb-6">
              <button
                onClick={() => setStep(1)}
                className="text-blue-600 hover:text-blue-700 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Services
              </button>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Select Date</h2>
            <div className="grid grid-cols-7 gap-2 mb-8">
              {calendarDays.map((date, index) => {
                const isSelected = selectedDate && isSameDay(date, selectedDate);
                const isPast = isBefore(date, startOfDay(new Date()));
                
                return (
                  <button
                    key={index}
                    onClick={() => !isPast && handleDateSelect(date)}
                    disabled={isPast}
                    className={`p-3 text-center rounded-lg transition ${
                      isPast
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : isSelected
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-50 hover:bg-blue-100 text-gray-800'
                    }`}
                  >
                    <div className="text-xs font-semibold">{format(date, 'EEE')}</div>
                    <div className="text-lg font-bold">{format(date, 'd')}</div>
                  </button>
                );
              })}
            </div>
            
            {selectedDate && (
              <>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  Available Times for {format(selectedDate, 'MMMM do')}
                </h3>
                {loadingSlots ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : availableSlots.length > 0 ? (
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mb-6">
                    {availableSlots.map((slot, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleTimeSelect(slot)}
                        className={`p-3 rounded-lg text-center transition ${
                          selectedTime?.time === slot.time
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 hover:bg-blue-100 text-gray-800'
                        }`}
                      >
                        {slot.display}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">No available slots for this date. Please select another date.</p>
                )}
                
                {selectedTime && (
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={handleNextToDetails}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                      Continue to Details
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
        
        {/* Step 3 - Enter Details & Confirm */}
        {step === 3 && selectedService && selectedDate && selectedTime && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="mb-6">
              <button
                onClick={() => setStep(2)}
                className="text-blue-600 hover:text-blue-700 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Date & Time
              </button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Booking Summary */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-lg text-gray-800 mb-4">Booking Summary</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Service</p>
                    <p className="font-medium text-gray-800">{selectedService.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Date</p>
                    <p className="font-medium text-gray-800">{format(selectedDate, 'MMMM do, yyyy')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Time</p>
                    <p className="font-medium text-gray-800">{selectedTime.display}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="font-medium text-gray-800">{selectedService.duration} minutes</p>
                  </div>
                  <div className="border-t pt-3 mt-3">
                    <p className="text-sm text-gray-600">Total Price</p>
                    <p className="text-2xl font-bold text-blue-600">${selectedService.price}</p>
                  </div>
                </div>
              </div>
              
              {/* Customer Form */}
              <div>
                <h3 className="font-semibold text-lg text-gray-800 mb-4">Your Information</h3>
                <form onSubmit={handleSubmitBooking}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="full_name"
                        required
                        value={formData.full_name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone (Optional)
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notes (Optional)
                      </label>
                      <textarea
                        name="notes"
                        rows="3"
                        value={formData.notes}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    {bookingError && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-sm text-red-600">{bookingError}</p>
                      </div>
                    )}
                    
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? 'Booking...' : 'Book Appointment'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingPage;