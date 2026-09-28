import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { getApiUrl } from "../../config/config.js";

/**
 * Employer Manager sign-in.
 *
 * Employer Managers are manager accounts carrying `isEmployerManager`, so this
 * posts to the same endpoint as the manager login — it just refuses accounts
 * that aren't Employer Managers and lands on their own dashboard.
 */
export default function EmployerManagerLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch(getApiUrl("/api/manager/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });
      const userData = await response.json();
      if (!response.ok) throw new Error(userData.message || "Invalid credentials");

      // Sending a plain manager here would give them a dashboard that hides
      // their own work, so point them at the right door instead.
      if (!userData?.data?.user?.isEmployerManager) {
        throw new Error("This isn't an Employer Manager account. Use the manager sign-in.");
      }

      login(userData);
      navigate("/employermanager/dashboard", { replace: true });
    } catch (error) {
      toast.error(error.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <Toaster position="top-center" />
      <div className="w-full max-w-md">
        <img src="/assets/logo.png" alt="Zepul" className="h-10 w-28 object-contain mb-8" />
        <h1 className="text-3xl font-semibold mb-2">Employer Manager sign in</h1>
        <p className="text-gray-500 mb-8 text-sm">
          Manage your own hiring — your requirements stay private to your team.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="em-email" className="block text-sm font-medium text-gray-700 mb-1">
              Work email
            </label>
            <input
              id="em-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@company.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
            />
          </div>
          <div>
            <label htmlFor="em-password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="em-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-3 rounded-lg font-medium transition-colors"
          >
            {isLoading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          New here?{" "}
          <Link to="/employermanager/signup" className="text-blue-600 font-medium hover:underline">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
