import React, { useState } from "react";

const BankDetailsSetup = ({ onComplete, onBack }) => {
  const [formData, setFormData] = useState({
    accountHolderName: "",
    bankName: "",
    accountNumber: "",
    confirmAccountNumber: "",
    ifscCode: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.accountHolderName.trim()) {
      newErrors.accountHolderName = "Account holder name is required";
    }

    if (!formData.bankName.trim()) {
      newErrors.bankName = "Bank name is required";
    }

    if (!formData.accountNumber.trim()) {
      newErrors.accountNumber = "Account number is required";
    } else if (formData.accountNumber.length < 9) {
      newErrors.accountNumber = "Account number must be at least 9 digits";
    }

    if (!formData.confirmAccountNumber.trim()) {
      newErrors.confirmAccountNumber = "Please confirm account number";
    } else if (formData.accountNumber !== formData.confirmAccountNumber) {
      newErrors.confirmAccountNumber = "Account numbers do not match";
    }

    if (!formData.ifscCode.trim()) {
      newErrors.ifscCode = "IFSC code is required";
    } else if (formData.ifscCode.length !== 11) {
      newErrors.ifscCode = "IFSC code must be 11 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProceed = async () => {
    if (validateForm()) {
      setIsSubmitting(true);
      console.log("Bank details:", formData);
      
      try {
        await onComplete?.(formData);
      } catch (error) {
        console.error("Error submitting bank details:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Column */}
      <div className="w-1/2 bg-blue-600 flex flex-col justify-between p-12 relative">
        <div className="absolute top-8 left-8">
          <div className="text-white text-2xl font-bold">Zepul</div>
        </div>

        <div className="mt-24">
          <div className="text-4xl font-bold text-white mb-4">
            Let's Get You Set Up
          </div>
          <div className="text-white text-lg opacity-90">
            Add your bank details to enable seamless payouts and revenue sharing.
          </div>
        </div>

        <div className="flex justify-center items-end">
          <div className="relative w-[900px] h-[500px]">
            <img
              src="/Investmentdata.png"
              alt="Financial setup illustration"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      </div>

      {/* Right Column */}
      <div className="w-1/2 bg-white flex flex-col justify-center p-12">
        <div className="max-w-md mx-auto w-full">
          <div className="text-2xl font-bold text-gray-900 mb-8">
            Complete Your Profile To Get Started
          </div>

          <div className="space-y-6">
            {/* Account Holder Name */}
            <div className="flex items-center space-x-4">
              <label className="w-48 text-sm font-medium text-gray-700 flex-shrink-0">
                Account Holder Name
              </label>
              <div className="flex-1">
                <input
                  type="text"
                  name="accountHolderName"
                  value={formData.accountHolderName}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.accountHolderName
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="Micheal"
                />
                {errors.accountHolderName && (
                  <div className="text-red-500 text-sm mt-1">
                    {errors.accountHolderName}
                  </div>
                )}
              </div>
            </div>

            {/* Bank Name */}
            <div className="flex items-center space-x-4">
              <label className="w-48 text-sm font-medium text-gray-700 flex-shrink-0">
                Bank Name :
              </label>
              <div className="flex-1">
                <input
                  type="text"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.bankName ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="HDFC Bank"
                />
                {errors.bankName && (
                  <div className="text-red-500 text-sm mt-1">
                    {errors.bankName}
                  </div>
                )}
              </div>
            </div>

            {/* Account Number */}
            <div className="flex items-center space-x-4">
              <label className="w-48 text-sm font-medium text-gray-700 flex-shrink-0">
                Account Number
              </label>
              <div className="flex-1">
                <input
                  type="text"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.accountNumber
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="123456789012"
                />
                {errors.accountNumber && (
                  <div className="text-red-500 text-sm mt-1">
                    {errors.accountNumber}
                  </div>
                )}
              </div>
            </div>

            {/* Confirm Account Number */}
            <div className="flex items-center space-x-4">
              <label className="w-48 text-sm font-medium text-gray-700 flex-shrink-0">
                Confirm Account Number :
              </label>
              <div className="flex-1">
                <input
                  type="text"
                  name="confirmAccountNumber"
                  value={formData.confirmAccountNumber}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.confirmAccountNumber
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="123456789012"
                />
                {errors.confirmAccountNumber && (
                  <div className="text-red-500 text-sm mt-1">
                    {errors.confirmAccountNumber}
                  </div>
                )}
              </div>
            </div>

            {/* IFSC Code */}
            <div className="flex items-center space-x-4">
              <label className="w-48 text-sm font-medium text-gray-700 flex-shrink-0">
                IFSC Code :
              </label>
              <div className="flex-1">
                <input
                  type="text"
                  name="ifscCode"
                  value={formData.ifscCode}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.ifscCode ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="HDFC0001234"
                />
                {errors.ifscCode && (
                  <div className="text-red-500 text-sm mt-1">
                    {errors.ifscCode}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex space-x-8 mt-8">
            <div
              onClick={onBack}
              className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center cursor-pointer"
            >
              Back
            </div>
            <div
              onClick={handleProceed}
              className={`px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? 'Saving...' : 'Proceed'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BankDetailsSetup;
