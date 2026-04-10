import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <h1 className="text-8xl font-bold text-slate-200 mb-2">404</h1>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Page Not Found</h2>
        <p className="text-slate-500 mb-6">The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/login" className="px-6 py-2.5 bg-brand-primary text-white rounded-xl font-semibold hover:bg-orange-600 transition inline-block">
          Back to Login
        </Link>
      </div>
    </div>
  );
}
