import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { useMarketplaceAuth } from "../context/MarketplaceAuthContext";

const ROLE_CONFIG = {
  partnerlead: {
    label: "Partner Lead",
    dashboardRoute: "/partnerlead/marketplace/dashboard",
    signupRoute: "/partnerlead/marketplace/signup",
  },
  talentscout: {
    label: "Talent Scout",
    dashboardRoute: "/talentscout/marketplace/dashboard",
    signupRoute: "/talentscout/marketplace/signup",
  },
};

const DEFAULT_ROLE = "partnerlead";

export default function MarketplaceUnifiedLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, isLoading: authLoading, user } = useMarketplaceAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState(DEFAULT_ROLE);
  const [isLoading, setIsLoading] = useState(false);

  // Apply role hint passed through navigation state (e.g. from redirects)
  useEffect(() => {
    const hintedRole = location.state?.role;
    if (hintedRole && ROLE_CONFIG[hintedRole]) {
      setSelectedRole(hintedRole);
    }
  }, [location.state]);

  // Redirect already-authenticated users straight to their dashboard
  useEffect(() => {
    if (!authLoading && isAuthenticated()) {
      const storedRole = user?.userRole === "recruiter" ? "talentscout" : "partnerlead";
      const targetRoute = ROLE_CONFIG[storedRole]?.dashboardRoute ?? ROLE_CONFIG[DEFAULT_ROLE].dashboardRoute;
      navigate(targetRoute, { replace: true });
    }
  }, [authLoading, isAuthenticated, navigate, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await login(email, password);

      if (result.success) {
        toast.success("Login successful!");
        const resolvedRole = result.user?.userRole === "recruiter" ? "talentscout" : "partnerlead";
        if (ROLE_CONFIG[resolvedRole]) {
          setSelectedRole(resolvedRole);
        }
        const targetRoute = ROLE_CONFIG[resolvedRole]?.dashboardRoute ?? ROLE_CONFIG[selectedRole].dashboardRoute;
        navigate(targetRoute, { replace: true });
      } else {
        toast.error(result.error || "Login failed");
      }
    } catch (error) {
      toast.error("An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = (event) => {
    event.preventDefault();
    toast.info("Forgot password functionality will be implemented soon!");
  };

  const signupRoute = ROLE_CONFIG[selectedRole].signupRoute;

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
          <p className="text-gray-500 mb-8 text-sm">Choose your role to access the marketplace dashboard.</p>

          {/* Role toggle */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex rounded-lg bg-gray-100 p-1">
              {Object.entries(ROLE_CONFIG).map(([role, config]) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setSelectedRole(role)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150 cursor-pointer ${
                    selectedRole === role ? "bg-blue-600 text-white shadow" : "text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {config.label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter email address"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 pr-10"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg
                    width="22"
                    height="22"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <a href="#" className="text-blue-600 hover:underline" onClick={handleForgotPassword}>
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium flex items-center justify-center transition-colors text-base disabled:opacity-50"
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="mt-6 flex flex-col md:flex-row items-center justify-between text-xs text-gray-400">
            <span>
              By signing in you're accepting our{" "}
              <a href="#" className="text-blue-600 hover:underline">
                Terms &amp; Conditions
              </a>
              ,{" "}
              <a href="#" className="text-blue-600 hover:underline">
                Privacy Policy
              </a>
            </span>
          </div>

          {/* Signup link */}
          <div className="mt-4 text-center">
            <span className="text-gray-600 text-sm">Don't have an account? </span>
            <button
              onClick={() => navigate(signupRoute)}
              className="text-blue-600 hover:underline text-sm font-medium"
            >
              Sign up here
            </button>
          </div>

          {/* Back to home link */}
          <div className="mt-2 text-center">
            <button onClick={() => navigate("/")} className="text-blue-600 hover:underline text-sm">
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
