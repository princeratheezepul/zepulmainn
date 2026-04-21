import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast, { Toaster } from "react-hot-toast";
import { config } from "../config/config";

const dashboardRoutes = {
    recruiter: "/recruiter",
    manager: "/manager",
    accountmanager: "/accountmanager"
};

export default function SignIn() {
    const navigate = useNavigate();
    const { login, isAuthenticated, user } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (isAuthenticated && user) {
            let dashboardRoute = dashboardRoutes[user.type] || "/";
            if (user.type === "manager" && user.isProRecruiter) {
                dashboardRoute = "/prorecruiter/dashboard";
            }
            navigate(dashboardRoute, { replace: true });
        }
    }, [isAuthenticated, user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await fetch(`${config.backendUrl}/api/manager/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
                credentials: "include"
            });
            const userData = await response.json();
            if (!response.ok) {
                throw new Error(userData.message || "Login failed");
            }
            if (userData.token || userData.accessToken) {
                localStorage.setItem('authToken', userData.token || userData.accessToken);
            }
            let normalizedUserData = userData;
            login(normalizedUserData);
            toast.success("Login successful!");
            let dashboardRoute = dashboardRoutes[normalizedUserData.data?.user?.type] || "/";

            if (
                normalizedUserData.data?.user?.type === "manager" &&
                normalizedUserData.data?.user?.isProRecruiter
            ) {
                dashboardRoute = "/prorecruiter/dashboard";
            }

            // Check if it's a ProRecruiter manager
            if (
                normalizedUserData.data?.user?.type === "manager" &&
                normalizedUserData.data?.user?.isProRecruiter
            ) {
                const hasCompany = normalizedUserData.data?.user?.companys && normalizedUserData.data?.user?.companys.length > 0;
                const hasJobs = normalizedUserData.data?.user?.jobs && normalizedUserData.data?.user?.jobs.length > 0;

                if (!hasCompany) {
                    // No company -> go to company onboarding
                    dashboardRoute = "/onboarding/company";
                } else if (!hasJobs) {
                    // Has company, but no jobs -> go to first job registration
                    dashboardRoute = "/register-first-job";
                }
            }

            setTimeout(() => {
                navigate(dashboardRoute, { replace: true });
            }, 100);
        } catch (error) {
            toast.error(error.message || "Login failed");
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
                    <h2 className="text-3xl font-semibold mb-2">Welcome back</h2>
                    <p className="text-gray-500 mb-8 text-sm">Your dashboard is ready to help you stay on track.</p>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label htmlFor="signin-email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                id="signin-email"
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                                placeholder="Enter email address"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                            />
                        </div>
                        <div>
                            <label htmlFor="signin-password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <div className="relative">
                                <input
                                    id="signin-password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                    placeholder="Enter password"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 pr-10"
                                />
                                <span
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                            <line x1="1" y1="1" x2="23" y2="23"></line>
                                        </svg>
                                    ) : (
                                        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"></path>
                                            <circle cx="12" cy="12" r="3"></circle>
                                        </svg>
                                    )}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <a href="#" className="text-blue-600 hover:underline" onClick={(e) => {
                                e.preventDefault();
                                navigate('/manager/forgot-password');
                            }}>Forgot password?</a>
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium flex items-center justify-center transition-colors text-base"
                        >
                            {isLoading ? "Logging in..." : "Login"}
                        </button>
                    </form>
                    <div className="mt-6 text-center text-sm text-gray-500">
                        Don't have an account?{' '}
                        <Link to="/signup/prorecruiter" className="text-blue-600 font-medium hover:underline">Create now</Link>
                    </div>
                    <div className="mt-4 flex flex-col md:flex-row items-center justify-between text-xs text-gray-400">
                        <span>
                            By signing in your accepting our{' '}
                            <a href="#" className="text-blue-600 hover:underline">Terms & Conditions</a>,{' '}
                            <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
