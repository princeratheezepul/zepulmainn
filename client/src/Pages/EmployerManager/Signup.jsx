import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { config } from "../../config/config";

// Employer Managers hire for their own company, so a work address is the point.
const BLOCKED_DOMAINS = [
  "gmail.com", "yahoo.com", "yahoo.in", "yahoo.co.in", "hotmail.com", "outlook.com",
  "live.com", "aol.com", "icloud.com", "me.com", "mac.com", "mail.com",
  "protonmail.com", "proton.me", "zoho.com", "yandex.com", "gmx.com", "gmx.net",
  "rediffmail.com", "msn.com", "fastmail.com", "tutanota.com", "inbox.com", "mail.ru",
];

const isWorkEmail = (email) => {
  const domain = email.split("@")[1]?.toLowerCase();
  return Boolean(domain) && !BLOCKED_DOMAINS.includes(domain);
};

export default function EmployerManagerSignup() {
  const navigate = useNavigate();
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isWorkEmail(email)) {
      toast.error("Please use your work email address.");
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`${config.backendUrl}/api/manager/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullname,
          username: email.split("@")[0],
          email,
          password,
          // What makes this an Employer Manager rather than a plain manager:
          // their jobs stay private to them.
          isEmployerManager: true,
        }),
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Signup failed");

      toast.success("Account created. Sign in to get started.");
      setTimeout(() => navigate("/employermanager/login", { replace: true }), 900);
    } catch (error) {
      toast.error(error.message || "Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <Toaster position="top-center" />
      <div className="w-full max-w-md">
        <img src="/assets/logo.png" alt="Zepul" className="h-10 w-28 object-contain mb-8" />
        <h1 className="text-3xl font-semibold mb-2">Create an Employer Manager account</h1>
        <p className="text-gray-500 mb-8 text-sm">
          Post your own roles, add your recruiters, and run the pipeline. Your requirements
          are visible only to you and your team.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="em-name" className="block text-sm font-medium text-gray-700 mb-1">
              Full name
            </label>
            <input
              id="em-name"
              type="text"
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              required
              placeholder="Enter your full name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
            />
          </div>
          <div>
            <label htmlFor="em-signup-email" className="block text-sm font-medium text-gray-700 mb-1">
              Work email
            </label>
            <input
              id="em-signup-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@company.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
            />
          </div>
          <div>
            <label htmlFor="em-signup-password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="em-signup-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Create a password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-3 rounded-lg font-medium transition-colors"
          >
            {isLoading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link to="/employermanager/login" className="text-blue-600 font-medium hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
