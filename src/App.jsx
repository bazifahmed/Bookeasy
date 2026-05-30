import { Routes, Route } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import DashboardHome from './pages/DashboardHome'; // Your dashboard home component
import BookingsPage from './pages/BookingsPage';
import BookingPage from './pages/BookingPage';
import ServicesPage from './pages/ServicesPage';
import AvailabilityPage from './pages/AvailabilityPage';
import ClientsPage from './pages/ClientsPage';
import SettingsPage from './pages/SettingsPage';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />}>
          <Route index element={<DashboardHome />} />
          <Route path="bookings" element={<BookingsPage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="availability" element={<AvailabilityPage />} />
          <Route path="clients" element={<ClientsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Route>
      
      <Route path="/book/:slug" element={<BookingPage />} />
      <Route path="*" element={<LandingPage />} />
    </Routes>
  );
}

export default App;