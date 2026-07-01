import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { config } from "../config/config";

export default function CandidateDetails() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const candidate = (() => {
    try {
      return JSON.parse(localStorage.getItem("candidateInfo")) || null;
    } catch {
      return null;
    }
  })();

  // If there's no candidate session, send them back to signup
  useEffect(() => {
    if (!candidate?._id) {
      navigate("/candidate/signup", { replace: true });
    }
  }, [candidate, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!candidate?._id) return;
    setIsLoading(true);
    try {
      const response = await fetch(
        `${config.backendUrl}/api/candidate/${candidate._id}/profile`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fullName, phoneNumber, address }),
          credentials: "include",
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Could not save details");
      }

      localStorage.setItem("candidateInfo", JSON.stringify(data.data?.user || candidate));
      toast.success("Profile saved!");
      setTimeout(() => navigate("/candidate/dashboard", { replace: true }), 700);
    } catch (error) {
      toast.error(error.message || "Could not save details");
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
      {/* Right details form */}
      <div className="flex flex-col justify-center items-center w-full md:w-1/2 min-h-screen px-4 py-8 md:py-0">
        <div className="w-full max-w-xl p-0 md:p-0 rounded-xl">
          <h2 className="text-3xl font-semibold mb-2">Complete your profile</h2>
          <p className="text-gray-500 mb-8 text-sm">Tell us a little more about you.</p>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="Enter your full name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
              />
            </div>
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                id="phoneNumber"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
                placeholder="Enter your phone number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
              />
            </div>
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <textarea
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                rows={3}
                placeholder="Enter your address"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium flex items-center justify-center transition-colors text-base"
            >
              {isLoading ? "Saving..." : "Continue to Dashboard"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
