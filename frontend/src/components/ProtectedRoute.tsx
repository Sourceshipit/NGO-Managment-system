import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from './UI/LoadingSpinner';

const roleRoutes: Record<string, string> = {
  ADMIN: '/dashboard',
  NGO_STAFF: '/staff/dashboard',
  VOLUNTEER: '/volunteer/dashboard',
  DONOR: '/donor/dashboard',
};

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  if (isLoading) return <LoadingSpinner text="Loading..." />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return <>{children}</>;
}

export function RequireRole({ roles, children }: { roles: string[]; children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <LoadingSpinner text="Loading..." />;
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) {
    return <Navigate to={roleRoutes[user.role] || '/login'} replace />;
  }
  return <>{children}</>;
}

export function RedirectIfAuth({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <LoadingSpinner text="Loading..." />;
  if (user) return <Navigate to={roleRoutes[user.role] || '/dashboard'} replace />;
  return <>{children}</>;
}

export function AccessDenied() {
  const { user } = useAuth();
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m-4-6V7a4 4 0 118 0v4h2a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6a2 2 0 012-2h2z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Access Denied</h2>
        <p className="text-slate-500 mb-4">You don't have permission to access this page.</p>
        <a href={roleRoutes[user?.role || ''] || '/login'} className="px-6 py-2.5 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition inline-block">
          Go to Dashboard
        </a>
      </div>
    </div>
  );
}
