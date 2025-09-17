import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMarketplaceAuth } from '../context/MarketplaceAuthContext';

const MarketplaceProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useMarketplaceAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated()) {
        // If not authenticated, redirect to login
        navigate('/marketplace/login', { 
          state: { from: location.pathname },
          replace: true 
        });
      } else if (location.pathname === '/marketplace/login') {
        // If already authenticated and trying to access login, redirect to dashboard
        navigate('/marketplace/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, isLoading, navigate, location]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If not authenticated, don't render children (will redirect)
  if (!isAuthenticated()) {
    return null;
  }

  // If authenticated, render children
  return children;
};

export default MarketplaceProtectedRoute;
