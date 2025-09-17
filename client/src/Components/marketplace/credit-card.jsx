"use client";

import { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";
import { useMarketplaceAuth } from "../../context/MarketplaceAuthContext";

function CreditCardContent() {
  const marketplaceAuth = useMarketplaceAuth();
  const { fetchBankDetails, saveBankDetails } = marketplaceAuth || {};
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [bankDetails, setBankDetails] = useState([]);
  const [error, setError] = useState(null);
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
      if (!fetchBankDetails) {
        setError('Bank details service not available');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const result = await fetchBankDetails();
        if (result && result.success) {
          console.log('Bank details received:', result.bankDetails);
          setBankDetails(result.bankDetails || []);
        } else {
          setError(result?.error || 'Failed to fetch bank details');
          setBankDetails([]);
        }
      } catch (error) {
        console.error('Error loading bank details:', error);
        setError('Failed to load bank details');
        setBankDetails([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadBankDetails();
  }, [fetchBankDetails]);


  // Format account number for display
  const formatAccountNumber = (accountNumber) => {
    if (!accountNumber) return "";
    
    // Convert to string if it's not already
    const accountStr = String(accountNumber);
    
    // Check if it's long enough to slice
    if (accountStr.length < 4) return accountStr;
    
    const last4 = accountStr.slice(-4);
    return `**** ${last4}`;
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle add account
  const handleAddAccount = async () => {
    if (!saveBankDetails || !fetchBankDetails) {
      alert('Bank details service not available');
      return;
    }

    try {
      if (formData.accountNumber !== formData.confirmAccountNumber) {
        alert('Account numbers do not match');
        return;
      }

      const result = await saveBankDetails(formData);
      if (result && result.success) {
        // Refresh bank details
        const fetchResult = await fetchBankDetails();
        if (fetchResult && fetchResult.success) {
          setBankDetails(fetchResult.bankDetails || []);
        }
        setIsModalOpen(false);
        setFormData({
          accountHolderName: "",
          accountNumber: "",
          confirmAccountNumber: "",
          ifscCode: "",
          bankName: ""
        });
      } else {
        alert(`Failed to add bank details: ${result?.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error adding account:', error);
      alert('Failed to add account');
    }
  };


  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <div className="text-lg font-semibold text-gray-900 mb-6">Accounts</div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <div className="text-lg font-semibold text-gray-900 mb-6">Accounts</div>
        <div className="text-center py-8">
          <div className="text-red-600 mb-2">Error loading accounts</div>
          <div className="text-sm text-gray-500 mb-4">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

    return (
      <div className="bg-white rounded-lg border p-6">
        <div className="text-lg font-semibold text-gray-900 mb-6">Accounts</div>
  
      {/* Bank Details Cards */}
      {bankDetails.length > 0 ? (
        <div className="flex justify-around items-center mb-6">
          {bankDetails.map((bankDetail, index) => {
            const isOrange = index % 2 === 0;
            return (
            <div
                key={bankDetail._id || index}
                className="rounded-xl p-4 relative overflow-hidden text-black"
              style={{
                width: "240px",
                height: "145px",
                boxShadow: "8px 8px 64px 0px rgba(0, 0, 0, 0.2)",
                  background: isOrange 
                  ? "linear-gradient(90deg, #E28C87 0%, #E3987B 50%, #E5EFA8 100%)" 
                  : "linear-gradient(90deg, #5685FF 0%, #ABB1C1 50%, #0449FF 100%)",
              }}
            >
                <div className="flex justify-between items-start mb-2">
                  <div></div>
                  <div className="text-xs font-medium">{bankDetail.bankName || 'Unknown Bank'}</div>
                </div>
                <div className="text-sm font-semibold mb-1">{formatAccountNumber(bankDetail.accountNumber)}</div>
                <div className="text-xs opacity-90 mb-2">{bankDetail.ifscCode || 'N/A'}</div>
                
                {/* Account Holder Name at Bottom Right */}
                <div className="absolute bottom-2 right-2">
                  <div className="text-xs font-medium">{bankDetail.accountHolderName || 'Unknown Holder'}</div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>No bank accounts added yet</p>
          <p className="text-sm">Add your first bank account to get started</p>
        </div>
      )}

      {/* Add New Account Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-blue-600 hover:text-blue-700 font-medium hover:bg-gray-50 transition-colors"
      >
        + Add Bank Details
      </button>

      {/* Add Account Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-4">
              <div className="text-xl font-bold text-gray-900">Add Bank Account</div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bank Name
                </label>
                <input
                  type="text"
                  value={formData.bankName}
                  onChange={(e) => handleInputChange('bankName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter bank name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Holder Name
                </label>
                <input
                  type="text"
                  value={formData.accountHolderName}
                  onChange={(e) => handleInputChange('accountHolderName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter account holder name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Number
                </label>
                <input
                  type="text"
                  value={formData.accountNumber}
                  onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter account number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Account Number
                </label>
                <input
                  type="text"
                  value={formData.confirmAccountNumber}
                  onChange={(e) => handleInputChange('confirmAccountNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Confirm account number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  IFSC Code
                </label>
                <input
                  type="text"
                  value={formData.ifscCode}
                  onChange={(e) => handleInputChange('ifscCode', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter IFSC code"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setIsModalOpen(false)}
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
  
      </div>
    );
  }

// Wrapper component with error boundary
export default function CreditCard() {
  try {
    return <CreditCardContent />;
  } catch (error) {
    console.error('Error in CreditCard component:', error);
    return (
      <div className="bg-white rounded-lg border p-6">
        <div className="text-lg font-semibold text-gray-900 mb-6">Accounts</div>
        <div className="text-center py-8">
          <div className="text-red-600 mb-2">Something went wrong</div>
          <div className="text-sm text-gray-500 mb-4">Unable to load bank accounts</div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }
  }
  