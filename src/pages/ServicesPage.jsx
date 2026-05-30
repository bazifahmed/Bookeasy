import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Clock, 
  DollarSign, 
  X, 
  Loader2, 
  AlertCircle 
} from 'lucide-react';

const ServicesPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    duration_minutes: '30',
    price: '',
    description: '',
    is_active: true
  });

  const durationOptions = [15, 30, 45, 60, 90, 120];

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching services:', error);
    } else {
      setServices(data || []);
    }
    setLoading(false);
  };

  const handleOpenModal = (service = null) => {
    if (service) {
      setEditingService(service);
      setFormData({
        name: service.name,
        duration_minutes: service.duration_minutes.toString(),
        price: service.price.toString(),
        description: service.description || '',
        is_active: service.is_active
      });
    } else {
      setEditingService(null);
      setFormData({ name: '', duration_minutes: '30', price: '', description: '', is_active: true });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('You must be logged in to save a service.');
      return;
    }

    const { data: business, error: bizError } = await supabase
      .from('businesses')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (bizError || !business) {
      alert('Could not find your business. Please refresh and try again.');
      return;
    }

    const payload = {
      business_id: business.id,
      name: formData.name,
      duration_minutes: parseInt(formData.duration_minutes),
      price: parseFloat(formData.price),
      description: formData.description,
      is_active: formData.is_active,
    };

    let error;
    if (editingService) {
      const { error: updateError } = await supabase
        .from('services')
        .update(payload)
        .eq('id', editingService.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from('services')
        .insert([payload]);
      error = insertError;
    }

    if (error) {
      alert('Error saving service: ' + error.message);
    } else {
      setIsModalOpen(false);
      fetchServices();
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    const { error } = await supabase
      .from('services')
      .update({ is_active: !currentStatus })
      .eq('id', id);

    if (error) {
      alert('Error updating status');
    } else {
      setServices(services.map(s => s.id === id ? { ...s, is_active: !currentStatus } : s));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this service? This action cannot be undone.')) {
      const { error } = await supabase.from('services').delete().eq('id', id);
      if (error) {
        alert('Error deleting service');
      } else {
        fetchServices();
      }
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Services</h1>
          <p className="text-gray-500">Create and edit the services available for booking.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={20} />
          Add New Service
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64">
          <Loader2 className="animate-spin text-blue-600 mb-2" size={40} />
          <p className="text-gray-500">Loading your services...</p>
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <AlertCircle className="mx-auto text-gray-400 mb-3" size={48} />
          <p className="text-gray-600 font-medium">No services found.</p>
          <p className="text-gray-400 text-sm">Get started by adding your first service.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div key={service.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-lg text-gray-900 truncate pr-4">{service.name}</h3>
                <button
                  onClick={() => toggleStatus(service.id, service.is_active)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    service.is_active ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    service.is_active ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div className="space-y-2 mb-6">
                <div className="flex items-center text-gray-600 text-sm">
                  <Clock size={16} className="mr-2" />
                  {service.duration_minutes} minutes
                </div>
                <div className="flex items-center text-gray-600 text-sm font-semibold">
                  <DollarSign size={16} className="mr-1 text-green-600" />
                  {service.price.toFixed(2)}
                </div>
                {service.description && (
                  <p className="text-gray-500 text-xs mt-2 line-clamp-2 italic">
                    "{service.description}"
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  onClick={() => handleOpenModal(service)}
                  className="flex-1 flex items-center justify-center gap-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 py-2 rounded-md transition-colors"
                >
                  <Pencil size={14} /> Edit
                </button>
                <button
                  onClick={() => handleDelete(service.id)}
                  className="flex-1 flex items-center justify-center gap-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 py-2 rounded-md transition-colors"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">
                {editingService ? 'Edit Service' : 'Add New Service'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service Name</label>
                <input
                  required
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Haircut & Styling"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                  >
                    {durationOptions.map(opt => (
                      <option key={opt} value={opt}>{opt} mins</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Tell clients what's included..."
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  {editingService ? 'Update Service' : 'Create Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesPage;