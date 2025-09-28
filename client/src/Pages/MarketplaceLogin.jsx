import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { useMarketplaceAuth } from "../context/MarketplaceAuthContext";

export default function MarketplaceLogin() {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading: authLoading } = useMarketplaceAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated()) {
      navigate('/marketplace/dashboard', { replace: true });
    }
  }, [authLoading, isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const result = await login(email, password);
      
      if (result.success) {
        toast.success("Login successful!");
        navigate('/marketplace/dashboard', { replace: true });
      } else {
        toast.error(result.error || "Login failed");
      }
    } catch (error) {
      toast.error("An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      <Toaster position="top-center" />
      
      {/* Left illustration */}
      <div className="hidden md:flex flex-col justify-center items-center md:w-1/2 bg-gray-50 relative p-4">
        <img
          src="/Mobile login-cuate 1(1).png"
          alt="Illustration"
          className="w-full max-w-2xl md:max-w-3xl xl:max-w-4xl 2xl:max-w-5xl mb-8 object-contain"
        />
      </div>
      
      {/* Right login form */}
      <div className="flex flex-col justify-center items-center w-full md:w-1/2 min-h-screen px-4 py-8 md:py-0">
        <div className="w-full max-w-xl p-0 md:p-0 rounded-xl">
          <h2 className="text-3xl font-semibold mb-2">Welcome to Marketplace</h2>
          <p className="text-gray-500 mb-8 text-sm">Access your marketplace dashboard and start earning.</p>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="Enter email address"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="Enter password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  {showPassword ? (
                    // Eye Off Icon
                    <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a10.057 10.057 0 012.642-4.362M6.404 6.404A9.969 9.969 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.05 10.05 0 01-4.262 5.108M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18"/>
                    </svg>
                  ) : (
                    // Eye Icon
                    <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <a href="#" className="text-blue-600 hover:underline" onClick={(e) => {
                e.preventDefault();
                toast.info("Forgot password functionality will be implemented soon!");
              }}>
                Forgot password?
              </a>
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium flex items-center justify-center transition-colors text-base disabled:opacity-50"
            >
              {isLoading ? "Logging in..." : "Login to Marketplace"}
            </button>
          </form>
          
          <div className="mt-6 flex flex-col md:flex-row items-center justify-between text-xs text-gray-400">
            <span>
              By signing in you're accepting our{' '}
              <a href="#" className="text-blue-600 hover:underline">Terms & Conditions</a>,{' '}
              <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
            </span>
          </div>
          
          {/* Signup link */}
          <div className="mt-4 text-center">
            <span className="text-gray-600 text-sm">Don't have an account? </span>
            <button
              onClick={() => navigate('/marketplace/signup')}
              className="text-blue-600 hover:underline text-sm font-medium"
            >
              Sign up here
            </button>
          </div>
          
          {/* Back to home link */}
          <div className="mt-2 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-blue-600 hover:underline text-sm"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
