import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../content/AuthContext'

/**
 * Wrap protected routes with this component.
 *
 * Usage in your router:
 *   <Route element={<ProtectedRoute />}>
 *     <Route path="/dashboard" element={<Dashboard />} />
 *   </Route>
 */
export default function ProtectedRoute() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    // Prevent flash-redirect while Supabase resolves the session
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="text-gray-500 text-sm">Loading…</span>
      </div>
    )
  }

  if (!user) {
    // Preserve the attempted URL so we can redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <Outlet />
}