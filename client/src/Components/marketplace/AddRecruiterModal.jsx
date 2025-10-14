import React, { useState, useEffect } from 'react';
import { useMarketplaceAuth } from '../../context/MarketplaceAuthContext';
import toast from 'react-hot-toast';

const AddRecruiterForm = ({ isOpen, onClose, onSubmit }) => {
  const { user } = useMarketplaceAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    email: "",
    phone: "",
    password: "",
    onboardedBy: ""
  });

  // Set onboardedBy when component mounts or user changes
  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        onboardedBy: `${user.firstName} ${user.lastName}` || 'Manager'
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem('marketplace_token');

      const requestData = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        DOB: form.dateOfBirth,
        phone: form.phone,
        password: form.password
      };

      // Call the create talent scout by manager endpoint
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/marketplace/create-talent-scout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData)
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`Talent Scout created successfully!`);
        
        // Call the onSubmit callback with the form data
        onSubmit({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          dateOfBirth: form.dateOfBirth,
          onboardedBy: form.onboardedBy
        });
        
        // Clear form but keep the manager's name in onboardedBy
        setForm({
          firstName: "",
          lastName: "",
          dateOfBirth: "",
          email: "",
          phone: "",
          password: "",
          onboardedBy: form.onboardedBy // Keep the manager's name
        });
        
        if (onClose) onClose();
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to create recruiter');
      }
    } catch (err) {
      console.error('Error creating recruiter:', err);
      toast.error('Failed to create recruiter. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setForm({
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      email: "",
      phone: "",
      password: "",
      onboardedBy: form.onboardedBy // Keep the manager's name
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="w-full h-full">
      <div className="relative w-full bg-gray-50 p-4 md:p-6">
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold z-10"
          onClick={handleClose}
          aria-label="Close"
        >
          &times;
        </button>
        
        {/* Header */}
        <div className="mb-2 text-xs text-blue-600 font-semibold tracking-wide">ADD TALENT SCOUT</div>
        <h2 className="text-2xl font-bold mb-8 text-gray-900">Fill in the form</h2>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
            <div className="flex flex-col">
              <label className="text-sm text-gray-500 mb-1">First Name</label>
              <input
                type="text"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="First Name"
                required
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm text-gray-500 mb-1">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Last Name"
                required
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm text-gray-500 mb-1">DOB</label>
              <input
                type="date"
                name="dateOfBirth"
                value={form.dateOfBirth}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            <div className="flex flex-col">
              <label className="text-sm text-gray-500 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Email"
                required
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm text-gray-500 mb-1">Phone</label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Phone Number"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            <div className="flex flex-col">
              <label className="text-sm text-gray-500 mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Password"
                required
              />
            </div>
          </div>
          <div className="flex flex-col w-full">
            <label className="text-sm text-gray-500 mb-1">Onboarded by</label>
            <input
              type="text"
              name="onboardedBy"
              value={form.onboardedBy}
              disabled
              className="border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 cursor-not-allowed"
              placeholder="Manager Name"
              required
            />
          </div>
          <div className="flex justify-start mt-2 w-full">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-lg px-8 py-3 rounded-lg font-semibold shadow-none w-full md:w-56"
            >
              {isLoading ? 'Creating...' : 'Send Email'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRecruiterForm;
