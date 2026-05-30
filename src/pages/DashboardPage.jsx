import { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import DashboardLayout from '../components/DashboardLayout';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [businessProfile, setBusinessProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBusinessProfile = async () => {
      try {
        setLoading(true);
        
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) throw userError;
        if (!user) throw new Error('No user found');

        // Fetch business profile from businesses table
        const { data: business, error: businessError } = await supabase
          .from('businesses')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (businessError) {
          if (businessError.code === 'PGRST116') {
            navigate('/dashboard/settings');
            return;
          }
          throw businessError;
        }

        setBusinessProfile(business);
      } catch (err) {
        console.error('Error fetching business profile:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessProfile();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout 
      businessName={businessProfile?.business_name || "BookEasy"}
      accentColor={businessProfile?.accent_color || "#3B82F6"}
      businessSlug={businessProfile?.slug}
    >
      <Outlet />
    </DashboardLayout>
  );
};

export default DashboardPage;