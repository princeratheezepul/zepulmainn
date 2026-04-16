import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast, { Toaster } from "react-hot-toast";
import { config } from "../config/config";

export default function CompanyOnboarding() {
    const navigate = useNavigate();
    const { user, login } = useAuth(); // We might need to update user context
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        website: "",
        domain: "",
        location: "",
        companyType: "",
        employeeNumber: "",
        description: "",
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await fetch(`${config.backendUrl}/api/manager/create-prorecruiter-company`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("authToken")}` // Passing the token
                },
                body: JSON.stringify(formData),
                credentials: "include"
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || "Failed to create company");
            }

            toast.success("Company created! Redirecting to dashboard...");

            // Update local storage because user now has a company
            const storedUserInfoStr = localStorage.getItem('userInfo');
            if (storedUserInfoStr) {
                const storedUserInfo = JSON.parse(storedUserInfoStr);
                if (storedUserInfo.data && storedUserInfo.data.user && storedUserInfo.data.user.companys) {
                    storedUserInfo.data.user.companys.push(data.data.company._id);
                    localStorage.setItem('userInfo', JSON.stringify(storedUserInfo));
                    login(storedUserInfo); // re-trigger login contexts to see changes
                }
            }

            // Determine next route (Dashboard or First Job Registration)
            let nextRoute = "/prorecruiter/dashboard";
            if (storedUserInfoStr) {
                const storedUserInfo = JSON.parse(storedUserInfoStr);
                const hasJobs = storedUserInfo.data?.user?.jobs && storedUserInfo.data.user.jobs.length > 0;
                if (!hasJobs) {
                    nextRoute = "/register-first-job";
                }
            }

            setTimeout(() => navigate(nextRoute), 1500);

        } catch (error) {
            toast.error(error.message || "An error occurred");
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

            {/* Right form */}
            <div className="flex flex-col justify-center items-center w-full md:w-1/2 min-h-screen px-4 py-8 md:py-0">
                <div className="w-full max-w-xl p-0 md:p-0 rounded-xl">
                    <h2 className="text-3xl font-semibold mb-2">Tell us about your company</h2>
                    <p className="text-gray-500 mb-8 text-sm">Please provide a few details to get your workspace ready.</p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="company-name" className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                            <input
                                id="company-name"
                                name="name"
                                type="text"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                placeholder="E.g., Zepul"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                            />
                        </div>

                        <div className="flex gap-4">
                            <div className="w-1/2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                                <input
                                    name="website"
                                    type="url"
                                    value={formData.website}
                                    onChange={handleChange}
                                    placeholder="https://company.com"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                                />
                            </div>
                            <div className="w-1/2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Domain/Industry</label>
                                <input
                                    name="domain"
                                    type="text"
                                    value={formData.domain}
                                    onChange={handleChange}
                                    placeholder="E.g., Tech, Finance"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                                />
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="w-1/2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Company Size</label>
                                <select
                                    name="employeeNumber"
                                    value={formData.employeeNumber}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                                >
                                    <option value="">Select size</option>
                                    <option value="1-10">1-10 employees</option>
                                    <option value="11-50">11-50 employees</option>
                                    <option value="51-200">51-200 employees</option>
                                    <option value="201-500">201-500 employees</option>
                                    <option value="500+">500+ employees</option>
                                </select>
                            </div>
                            <div className="w-1/2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">HQ Location</label>
                                <input
                                    name="location"
                                    type="text"
                                    value={formData.location}
                                    onChange={handleChange}
                                    placeholder="E.g., New York, NY"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="3"
                                placeholder="Briefly describe what your company does..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                            ></textarea>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium flex items-center justify-center transition-colors text-base"
                        >
                            {isLoading ? "Setting up workspace..." : "Continue to Dashboard"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
