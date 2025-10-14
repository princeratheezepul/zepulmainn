"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { useMarketplaceAuth } from "../../../context/MarketplaceAuthContext";

export default function BankDetails() {
  const { fetchBankDetails, saveBankDetails, deleteBankDetails } = useMarketplaceAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [bankDetailToDelete, setBankDetailToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [bankDetails, setBankDetails] = useState([]);
  const [formData, setFormData] = useState({
    accountHolderName: "",
    accountNumber: "",
    confirmAccountNumber: "",
    ifscCode: "",
    bankName: ""
  });

  // Fetch bank details on component mount
  useEffect(() => {
    const loadBankDetails = async () => {
      setIsLoading(true);
      try {
        const result = await fetchBankDetails();
        if (result.success) {
          setBankDetails(result.bankDetails);
        } else {
          console.error('Failed to fetch bank details:', result.error);
        }
      } catch (error) {
        console.error('Error loading bank details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadBankDetails();
  }, []);

  // Get theme for card based on index
  const getCardTheme = (index) => {
    const isOrange = index % 2 === 0;
    return {
      gradient: isOrange 
        ? "linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)" 
        : "linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)",
      textColor: "text-white"
    };
  };

  // Format account number to show only last 4 digits
  const formatAccountNumber = (accountNumber) => {
    const numStr = accountNumber.toString();
    return `**** ${numStr.slice(-4)}`;
  };

  const addNewCard = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({
      accountHolderName: "",
      accountNumber: "",
      confirmAccountNumber: "",
      ifscCode: "",
      bankName: ""
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddAccount = async () => {
    try {
      // Validate form
      if (!formData.accountHolderName || !formData.accountNumber || !formData.ifscCode || !formData.bankName) {
        alert('Please fill in all required fields');
        return;
      }

      if (formData.accountNumber !== formData.confirmAccountNumber) {
        alert('Account numbers do not match');
        return;
      }

      const bankData = {
        accountHolderName: formData.accountHolderName,
        accountNumber: parseInt(formData.accountNumber),
        ifscCode: formData.ifscCode,
        bankName: formData.bankName
      };

      const result = await saveBankDetails(bankData);
      if (result.success) {
        // Refresh bank details
        const fetchResult = await fetchBankDetails();
        if (fetchResult.success) {
          setBankDetails(fetchResult.bankDetails);
        }
        closeModal();
      } else {
        alert(`Failed to save bank details: ${result.error}`);
      }
    } catch (error) {
      console.error('Error adding account:', error);
      alert('Failed to add account');
    }
  };

  const handleRemoveAccount = (bankDetail) => {
    setBankDetailToDelete(bankDetail);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      const result = await deleteBankDetails(bankDetailToDelete._id);
      if (result.success) {
        // Refresh bank details
        const fetchResult = await fetchBankDetails();
        if (fetchResult.success) {
          setBankDetails(fetchResult.bankDetails);
        }
        setIsDeleteModalOpen(false);
        setBankDetailToDelete(null);
      } else {
        alert(`Failed to delete bank details: ${result.error}`);
      }
    } catch (error) {
      console.error('Error removing account:', error);
      alert('Failed to remove account');
    }
  };

  const cancelDelete = () => {
    setIsDeleteModalOpen(false);
    setBankDetailToDelete(null);
  };

  if (isLoading) {
    return (
      <div className="w-full h-full overflow-y-auto">
        <div className="w-full p-6 bg-white min-h-full flex items-center justify-center">
          <div className="text-lg text-gray-600">Loading bank details...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-y-auto">
      <div className="w-full p-6 min-h-full">
        <div className="mb-3">
          <div className="text-3xl font-bold text-gray-900 mb-3">Bank Details</div>
          <div className="text-gray-600 leading-relaxed">
            Manage your bank account details for receiving payments and transactions.
          </div>
        </div>

        <div className="mb-6">
          <div className="text-xl font-semibold text-gray-900 mb-6">Bank Accounts</div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 mb-6" style={{ gap: '1rem' }}>
            {bankDetails.map((bankDetail, index) => {
              const theme = getCardTheme(index);
              return (
                <div key={bankDetail._id} className="relative">
                  {/* Bank Card */}
                  <div 
                    className="rounded-2xl p-6 shadow-lg min-h-[200px] flex flex-col justify-between"
                    style={{ background: theme.gradient }}
                  >
                    {/* Bank Name */}
                    <div className="flex justify-end">
                      <span className={`text-sm font-semibold ${theme.textColor}`}>
                        {bankDetail.bankName}
                      </span>
                    </div>
                    
                    {/* Account Number */}
                    <div className={`text-2xl font-bold ${theme.textColor} tracking-wider`}>
                      {formatAccountNumber(bankDetail.accountNumber)}
                    </div>
                    
                    {/* IFSC Code */}
                    <div className={`text-sm ${theme.textColor} font-medium opacity-90`}>
                      {bankDetail.ifscCode}
                    </div>
                    
                    {/* Account Holder Name */}
                    <div className="flex justify-end">
                      <span className={`text-sm font-semibold ${theme.textColor}`}>
                        {bankDetail.accountHolderName}
                      </span>
                    </div>
                  </div>
                  
                  {/* Remove Button */}
                  <div
                    onClick={() => handleRemoveAccount(bankDetail)}
                    className="mt-4 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg border border-gray-300 transition-colors duration-200 cursor-pointer"
                  >
                    Remove
                  </div>
                </div>
              );
            })}
            
            {/* Add New Card Button */}
            <div className="flex items-center justify-center">
              <div
                onClick={addNewCard}
                className="w-16 h-16 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition-colors duration-200 shadow-lg cursor-pointer"
              >
                <Plus className="h-6 w-6 text-white stroke-2" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Account Details Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            {/* Modal Header */}
            <div className="mb-6">
              <div className="text-xl font-bold text-gray-900">Account Details</div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bank Name
                </label>
                <input
                  type="text"
                  name="bankName"
                  value={formData.bankName}
                  placeholder="HDFC Bank"
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Holder Name
                </label>
                <input
                  type="text"
                  name="accountHolderName"
                  value={formData.accountHolderName}
                  placeholder="Micheal"
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Number
                </label>
                <input
                  type="text"
                  name="accountNumber"
                  value={formData.accountNumber}
                  placeholder="123456789012"
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Account Number
                </label>
                <input
                  type="text"
                  name="confirmAccountNumber"
                  value={formData.confirmAccountNumber}
                  placeholder="123456789012"
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  IFSC Code
                </label>
                <input
                  type="text"
                  name="ifscCode"
                  value={formData.ifscCode}
                  placeholder="HDFC001234"
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAddAccount}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && bankDetailToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            {/* Modal Header */}
            <div className="mb-4">
              <div className="text-xl font-bold text-gray-900">Delete Bank Account</div>
            </div>

            {/* Modal Content */}
            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete this bank account?
              </p>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-700">
                  <div className="font-medium mb-1">Bank: {bankDetailToDelete.bankName}</div>
                  <div className="font-medium mb-1">Account Holder: {bankDetailToDelete.accountHolderName}</div>
                  <div className="font-medium">Account: {formatAccountNumber(bankDetailToDelete.accountNumber)}</div>
                </div>
              </div>
              <p className="text-sm text-red-600 mt-3">
                This action cannot be undone.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
